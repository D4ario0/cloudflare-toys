# Workers KV cache adapter design

## Public API

`cloudflareKVCache(binding, options)` returns a `CloudflareKVCache`, which extends Drizzle's public `Cache` class. Options cover a namespace prefix, a default TTL, and an error observer. The adapter always uses Drizzle's `explicit` strategy. The KV binding is structurally typed to the three methods used by the adapter.

Keys are versioned as `<encoded-prefix>:v1:<query|tag>:<encoded-key>`. Query and tag domains are separate, prefixes isolate consumers sharing a namespace, and encoding prevents user input from changing key structure.

## Invalidation

Drizzle supplies a custom tag as the cache key. A tagged value can therefore be deleted directly without an index. Multiple tags are independent deletes and deletion errors propagate.

Automatic table invalidation is disabled. Cached queries with automatic invalidation enabled are rejected. Table-only mutation notifications are ignored so ordinary mutations remain usable with manually invalidated caches. Drizzle exposes automatic mutation callbacks and explicit table invalidation through the same `onMutate({ tables })` call, so rejecting explicit table invalidation separately is impossible under the public contract. No table dependency data is written.

Untagged entries use Drizzle's generated query hash and cannot practically be addressed later. They rely on expiration for eviction. Tagged entries are required when a consumer needs mutation-driven invalidation.

## Expiration

Relative seconds map directly to `expirationTtl`. Relative milliseconds round up to seconds. Absolute seconds map to `expiration`; absolute milliseconds round up to seconds. All expiration targets are validated against Workers KV's 60-second minimum. Values are never silently clamped. Redis hash expiration flags and retaining an existing TTL cannot be represented and are rejected.

## Failure policy

Reads and writes fail open and report through `onError` or `console.error`. Synchronous throws and asynchronous rejections from `onError` are ignored. A failed cache must not prevent a source query from succeeding. Malformed data is a reported miss. Explicit tag invalidation fails closed because it is requested after the caller knows cached data is stale. Configuration errors fail closed because silently ignoring TTL semantics is unsafe.

## Compatibility

The optional peer range is Drizzle `>=0.45.0` through v1 release candidates. The adapter uses `drizzle-orm/cache/core`, exported publicly by both endpoints. Endpoint contract checks cover `Cache`, `CacheConfig`, and `MutationOption`; the development version is pinned for reproducible builds.

## Rejected alternatives

- A KV reverse index was rejected because concurrent read-modify-write updates lose dependencies and KV has no transactions or compare-and-swap.
- Generation keys per table were rejected because multi-table queries cannot atomically observe or update generations, and KV propagation still permits stale reads.
- Listing keys during invalidation was rejected due to latency, pagination, broad fan-out, and namespace limits.
- Application-specific tag builders were rejected because cache identity belongs to each consumer.
- Immediate consistency claims were rejected because KV writes, deletes, and negative reads are eventually consistent across locations.
