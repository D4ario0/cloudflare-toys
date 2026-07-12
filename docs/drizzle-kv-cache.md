# Drizzle query cache with Workers KV

`cloudflare-toys/misc/drizzle/cache` adapts a Workers KV binding to Drizzle ORM's native query-cache API. It targets `drizzle-orm` 0.45.0 through the v1 release candidates.

## Install

```sh
pnpm add cloudflare-toys drizzle-orm
```

## Configure

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import { cloudflareKVCache } from "cloudflare-toys/misc/drizzle/cache";

const db = drizzle(connection, {
  cache: cloudflareKVCache(env.QUERY_CACHE, {
    prefix: "application",
    defaultTtlSeconds: 300,
  }),
});
```

The binding is passed explicitly. The adapter does not read Worker globals or depend on a database driver.

## Cache queries

The default `explicit` strategy caches only opted-in queries. Workers KV cannot correctly maintain Drizzle's table-to-query reverse index, so every cached query must disable automatic invalidation:

```ts
const rows = await db
  .select()
  .from(items)
  .$withCache({ autoInvalidate: false });
```

Without a custom tag, Drizzle hashes the SQL and parameters to produce the query key. This is the appropriate identity for most exact query-result caches.

A custom tag replaces the generated key and enables direct invalidation:

```ts
const rows = await db
  .select()
  .from(items)
  .$withCache({ tag: "items:active", autoInvalidate: false });

await db.$cache.invalidate({ tags: "items:active" });
await db.$cache.invalidate({ tags: ["items:active", "items:recent"] });
```

Tags are opaque application-defined cache identities. They may describe any useful scope, but they are not authorization boundaries. Do not reuse a tag for queries whose results differ.

## Strategies

`strategy: "explicit"` is the default and recommended mode. `strategy: "all"` asks Drizzle to cache every supported select. Because Drizzle enables automatic invalidation for global caching and KV cannot provide it, global queries must explicitly override caching behavior or they will be rejected. Use `"all"` only where all query sites are controlled and manual invalidation plus TTL-bounded staleness is acceptable.

## Expiration

`defaultTtlSeconds` applies when a query supplies no cache config. Per-query config maps as follows:

| Drizzle option | Workers KV option | Behavior |
| --- | --- | --- |
| `ex` | `expirationTtl` | Whole seconds |
| `px` | `expirationTtl` | Milliseconds rounded up to seconds |
| `exat` | `expiration` | Unix seconds |
| `pxat` | `expiration` | Unix milliseconds rounded up to seconds |

Workers KV requires expiration targets to be at least 60 seconds in the future. Smaller, invalid, or conflicting values are rejected rather than clamped. `keepTtl` cannot be represented by a KV `put`, and `hexOptions` is Redis-specific; both are rejected. Omitting expiration stores the entry without a TTL.

## Invalidation and consistency

Tag invalidation deletes tag keys directly. Table invalidation and Drizzle's automatic invalidation are unsupported. The adapter does not maintain a reverse index because KV has no atomic read-modify-write primitive; concurrent writers could lose dependencies, while index growth and expiration would add further correctness problems.

Workers KV is eventually consistent. Writes and deletions can take 60 seconds or more to become visible in other locations, and negative reads are cached. Explicit invalidation therefore does not provide globally immediate read-after-delete consistency. Use this adapter only when bounded stale reads are acceptable.

## Failures

Cache reads, writes, serialization failures, and malformed stored values fail open so the database remains the source of truth. They call `onError(error, operation)` when configured, otherwise they are logged with `console.error`. Explicit invalidation failures reject because continuing can leave known-stale data cached. Unsupported configuration also rejects.

Only JSON-compatible query results round-trip faithfully. Dates, binary values, class instances, `bigint`, and other non-JSON values require conversion by the query/driver before caching.
