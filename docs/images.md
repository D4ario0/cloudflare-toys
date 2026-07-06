# Images Storage API

Typed client for Cloudflare Images hosted image storage APIs.

Cloudflare Images also includes transformation features for images stored elsewhere. This helper is not an all-purpose Images SDK. It targets the hosted-images/storage API surface: upload, list, fetch details, update metadata/settings, delete, account stats, signing keys, predefined variants, and direct uploads.

Use this when you are working with the API endpoints under:

```txt
https://api.cloudflare.com/client/v4/accounts/{account_id}/images
```

See reference: https://developers.cloudflare.com/api/resources/images/

## Create a client

```ts
import createImagesStorageClient from "cloudflare-toys/images/storage";

const images = createImagesStorageClient({
  accountId: env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: env.CLOUDFLARE_API_TOKEN,
});
```

Methods return Better Fetch result objects:

```ts
const { data, error } = await images.get("image-id");

if (error) {
  console.error(error.status, error.statusText);
}
```

Cloudflare REST API errors are returned inside the Cloudflare response envelope. Use `isCFError` to distinguish that layer from Better Fetch request errors:

```ts
import createImagesStorageClient, { isCFError } from "cloudflare-toys/images/storage";

const { data, error } = await images.get("image-id");

if (error) {
  // Fetch, HTTP, parsing, or schema error.
  return;
}

if (isCFError(data)) {
  // Cloudflare API envelope error.
  console.error(data.errors);
  return;
}

console.log(data.result);
```

## Upload an image from a URL

```ts
const { data, error } = await images.upload({
  url: "https://example.com/logo.png",
  id: "logo",
  metadata: {
    source: "marketing-site",
  },
  requireSignedURLs: false,
});
```

## Upload a file or Blob

```ts
const file = formData.get("file");

if (file instanceof Blob) {
  const result = await images.upload({
    file,
    metadata: {
      uploadedBy: user.id,
    },
  });
}
```

`upload` expects exactly one of `url` or `file`.

## List images

```ts
const page = await images.list({
  page: 1,
  per_page: 50,
  creator: "dashboard",
});
```

Cloudflare Images also has a v2 listing endpoint with continuation tokens:

```ts
const firstPage = await images.listV2({
  per_page: 100,
  sort_order: "desc",
});

const nextPage = await images.listV2({
  continuation_token: firstPage.data?.result?.continuation_token,
  per_page: 100,
});
```

## Get, update, and delete

```ts
const image = await images.get("image-id");

await images.update("image-id", {
  metadata: {
    alt: "Product hero image",
  },
  requireSignedURLs: true,
});

await images.delete("image-id");
```

## Fetch the original image blob

```ts
const { data, error } = await images.blob("image-id");
```

The blob endpoint is exposed as an escape hatch for fetching the original image body.

## Account stats

```ts
const stats = await images.stats();
```

## Signing keys

```ts
const keys = await images.keys.list();

await images.keys.create("mobile-app");
await images.keys.delete("mobile-app");
```

## Variant management API

These methods manage Cloudflare Images variants in your account.

```ts
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

await images.variants.update("hero", {
  options: {
    fit: "cover",
    width: 1600,
    height: 900,
    metadata: "none",
  },
});

await images.variants.list();
await images.variants.get("hero");
await images.variants.delete("hero");
```

For typed delivery URLs, see [Image Variants](/variants).

## Direct uploads

Create a one-time upload URL so clients can upload directly to Cloudflare Images without sending the file through your Worker.

```ts
const { data, error } = await images.directUploads.create({
  id: "user-avatar-123",
  expiry: new Date(Date.now() + 30 * 60 * 1000),
  metadata: {
    kind: "avatar",
  },
});

const uploadURL = data?.result?.uploadURL;
```

If you set `requireSignedURLs`, do not also pass a custom `id`.
