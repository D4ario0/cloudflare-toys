import {
  Cache,
  type MutationOption,
} from "drizzle-orm/cache/core";
import type { CacheConfig } from "drizzle-orm/cache/core/types";

const MINIMUM_TTL_SECONDS = 60;
const KEY_VERSION = "v1";

export type KVCacheBinding = {
  get(key: string, type: "text"): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expiration?: number; expirationTtl?: number },
  ): Promise<void>;
  delete(key: string): Promise<void>;
};

export type KVCacheOperation = "read" | "write" | "deserialize";

export type CloudflareKVCacheOptions = {
  prefix?: string;
  defaultTtlSeconds?: number;
  strategy?: "explicit" | "all";
  onError?: (error: unknown, operation: KVCacheOperation) => void;
};

type KVExpiration = { expiration: number } | { expirationTtl: number };

export class CloudflareKVCache extends Cache {
  readonly #kv: KVCacheBinding;
  readonly #prefix: string;
  readonly #strategy: "explicit" | "all";
  readonly #defaultExpiration: KVExpiration | undefined;
  readonly #onError: CloudflareKVCacheOptions["onError"] | undefined;

  constructor(kv: KVCacheBinding, options: CloudflareKVCacheOptions = {}) {
    super();
    this.#kv = kv;
    this.#prefix = validatePrefix(options.prefix ?? "drizzle");
    this.#strategy = options.strategy ?? "explicit";
    this.#onError = options.onError;
    this.#defaultExpiration = options.defaultTtlSeconds === undefined
      ? undefined
      : toRelativeExpiration(options.defaultTtlSeconds, "defaultTtlSeconds");
  }

  strategy(): "explicit" | "all" {
    return this.#strategy;
  }

  async get(
    key: string,
    _tables: string[],
    isTag: boolean,
    isAutoInvalidate?: boolean,
  ): Promise<any[] | undefined> {
    if (isAutoInvalidate !== false) {
      throw new Error(
        "CloudflareKVCache does not support automatic table invalidation; pass autoInvalidate: false to $withCache()",
      );
    }

    let stored: string | null;
    try {
      stored = await this.#kv.get(this.#key(key, isTag), "text");
    } catch (error) {
      this.#report(error, "read");
      return undefined;
    }

    if (stored === null) return undefined;

    try {
      const value: unknown = JSON.parse(stored);
      if (!Array.isArray(value)) {
        throw new TypeError("The cached value is not a Drizzle result array");
      }
      return value;
    } catch (error) {
      this.#report(error, "deserialize");
      return undefined;
    }
  }

  async put(
    key: string,
    response: any,
    tables: string[],
    isTag: boolean,
    config?: CacheConfig,
  ): Promise<void> {
    if (tables.length > 0) {
      throw new Error(
        "CloudflareKVCache does not support automatic table invalidation; pass autoInvalidate: false to $withCache()",
      );
    }

    const expiration = expirationFromConfig(config, Date.now())
      ?? this.#defaultExpiration;

    try {
      const serialized = JSON.stringify(response);
      if (serialized === undefined) {
        throw new TypeError("The cached query result is not JSON-serializable");
      }
      await this.#kv.put(this.#key(key, isTag), serialized, expiration);
    } catch (error) {
      this.#report(error, "write");
    }
  }

  async onMutate(params: MutationOption): Promise<void> {
    const tags = normalizeStrings(params.tags);
    await Promise.all(tags.map((tag) => this.#kv.delete(this.#key(tag, true))));
  }

  #key(key: string, isTag: boolean): string {
    const kind = isTag ? "tag" : "query";
    return `${this.#prefix}:${KEY_VERSION}:${kind}:${encodeURIComponent(key)}`;
  }

  #report(error: unknown, operation: KVCacheOperation): void {
    if (this.#onError) {
      try {
        this.#onError(error, operation);
      } catch {
        // A cache error observer must not turn a fail-open operation into a failure.
      }
      return;
    }
    console.error(`CloudflareKVCache ${operation} failed`, error);
  }
}

export function cloudflareKVCache(
  kv: KVCacheBinding,
  options?: CloudflareKVCacheOptions,
): CloudflareKVCache {
  return new CloudflareKVCache(kv, options);
}

function validatePrefix(prefix: string): string {
  if (prefix.length === 0) throw new TypeError("prefix must not be empty");
  return encodeURIComponent(prefix);
}

function normalizeStrings(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function expirationFromConfig(
  config: CacheConfig | undefined,
  nowMilliseconds: number,
): KVExpiration | undefined {
  if (config === undefined) return undefined;
  if (config.keepTtl) {
    throw new TypeError("keepTtl is not supported by Workers KV");
  }
  if (config.hexOptions !== undefined) {
    throw new TypeError("hexOptions is Redis-specific and is not supported by Workers KV");
  }

  const fields = [config.ex, config.px, config.exat, config.pxat].filter(
    (value) => value !== undefined,
  );
  if (fields.length > 1) {
    throw new TypeError("Specify only one of ex, px, exat, or pxat");
  }
  if (config.ex !== undefined) return toRelativeExpiration(config.ex, "ex");
  if (config.px !== undefined) return toRelativeExpiration(config.px / 1000, "px");
  if (config.exat !== undefined) {
    return toAbsoluteExpiration(config.exat, nowMilliseconds, "exat");
  }
  if (config.pxat !== undefined) {
    return toAbsoluteExpiration(config.pxat / 1000, nowMilliseconds, "pxat");
  }
  return undefined;
}

function toRelativeExpiration(value: number, name: string): KVExpiration {
  assertPositiveFinite(value, name);
  const seconds = Math.ceil(value);
  if (seconds < MINIMUM_TTL_SECONDS) {
    throw new RangeError(`${name} must resolve to at least 60 seconds`);
  }
  return { expirationTtl: seconds };
}

function toAbsoluteExpiration(
  value: number,
  nowMilliseconds: number,
  name: string,
): KVExpiration {
  assertPositiveFinite(value, name);
  const seconds = Math.ceil(value);
  const minimum = Math.ceil(nowMilliseconds / 1000) + MINIMUM_TTL_SECONDS;
  if (seconds < minimum) {
    throw new RangeError(`${name} must resolve to at least 60 seconds in the future`);
  }
  return { expiration: seconds };
}

function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0 || !Number.isSafeInteger(Math.ceil(value))) {
    throw new RangeError(`${name} must be a positive finite safe number`);
  }
}
