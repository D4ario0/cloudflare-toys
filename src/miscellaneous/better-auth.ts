/// <reference types="@cloudflare/workers-types" />
import type { SecondaryStorage } from "better-auth";

export function asSecondaryStorage(kv: KVNamespace) {
  return {
    set: async (key: string, value: string, ttl?: number) =>
      await kv.put(key, value, ttl ? { expirationTtl: ttl } : undefined),
    get: async (key: string) => await kv.get(key),
    delete: async (key: string) => await kv.delete(key),
    getAndDelete: async (key: string) => {
      const value = await kv.get(key, "text");
      kv.delete(key);
      return value;
    },
    increment: async (key: string, ttl: number) => {
      let count = Number(await kv.get(key, "text"));
      count = (count ?? 0) + 1;
      await kv.put(key, count.toString(), { expirationTtl: ttl });
      return count;
    },
  } satisfies SecondaryStorage;
}
