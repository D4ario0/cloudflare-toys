# cloudflare-toys

Small typed, tree-shakeable helpers for Cloudflare Workers-adjacent projects.

Designed around subpath exports so apps only import the Cloudflare helpers they use.

Docs: https://d4ario0.github.io/cloudflare-toys/

## Install

```sh
pnpm add cloudflare-toys
```

## Cloudflare Images Storage

```ts
import createImagesStorageClient from "cloudflare-toys/images/storage";

const images = createImagesStorageClient({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
});

await images.upload({
  url: "https://example.com/logo.png",
  requireSignedURLs: false,
});

const image = await images.get("image-id");
const list = await images.list({ per_page: 50 });
const stats = await images.stats();
```

Grouped APIs are available for keys, variants, and direct uploads:

```ts
await images.keys.list();
await images.keys.create("mobile-app");

await images.variants.create({
  id: "hero",
  options: {
    fit: "cover",
    width: 1366,
    height: 768,
    metadata: "none",
  },
  neverRequireSignedURLs: true,
});

const directUpload = await images.directUploads.create({
  expiry: new Date(Date.now() + 30 * 60 * 1000),
});
```

The underlying Better Fetch client is still exposed as an escape hatch:

```ts
await images.$fetch("@get/v1/:image_id", {
  params: { image_id: "image-id" },
});
```

## Image delivery variants

```ts
import { defineVariants } from "cloudflare-toys/images/variants";

const images = defineVariants("account-hash", [
  { name: "thumbnail" },
  { name: "hero" },
  { name: "original" },
] as const);

const url = images.image_url({
  imageId: "image-id",
  variant: "hero",
});
```

## Workers Analytics Engine SQL API

```ts
import createWAEClient from "cloudflare-toys/wae";

const wae = createWAEClient({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
});

const result = await wae.query(`
  SELECT blob1, count() AS count
  FROM my_dataset
  GROUP BY blob1
`);
```

`query` also accepts objects with a `toSQL()` method, so it can pair with query builders.

## Better Auth + Workers KV

```ts
import { asSecondaryStorage } from "cloudflare-toys/misc/better-auth/secondaryStorage";

export const auth = betterAuth({
  secondaryStorage: asSecondaryStorage(env.AUTH_KV),
});
```

## Drizzle query cache + Workers KV

```ts
import { cloudflareKVCache } from "cloudflare-toys/misc/drizzle/cache";

const db = drizzle(connection, {
  cache: cloudflareKVCache(env.QUERY_CACHE, {
    prefix: "application",
    defaultTtlSeconds: 300,
  }),
});

await db.select().from(items).$withCache({
  tag: "items:list",
  autoInvalidate: false,
});

await db.$cache.invalidate({ tags: "items:list" });
```

## License

GPL-2.0
