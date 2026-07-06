# Delivery Variants

Typed image delivery URL helpers for Cloudflare Images hosted-image variants.

Use `cloudflare-toys/images/variants` when your app has a fixed set of image variants and you want TypeScript to catch invalid variant names.

## Declare variants

```ts
import { defineVariants } from "cloudflare-toys/images/variants";

export const images = defineVariants("account-hash", [
  { name: "thumbnail" },
  { name: "card" },
  { name: "hero" },
  { name: "original" },
] as const);
```

You can also attach optional metadata to each variant. Metadata is not used to build URLs, but it is useful for documenting your variant contract in code.

```ts
export const images = defineVariants("account-hash", [
  {
    name: "hero",
    metadata: {
      fit: "cover",
      width: 1600,
      height: 900,
      usage: "landing pages",
    },
  },
] as const);
```

The `as const` matters. It preserves each variant name as a literal type, so `image_url()` can restrict `variant` to only the names you declared.

```ts
images.image_url({
  imageId: "image-id",
  variant: "hero",
});

images.image_url({
  imageId: "image-id",
  // @ts-expect-error - not one of the declared variants
  variant: "banner",
});
```

## Build a delivery URL

```ts
const url = images.image_url({
  imageId: "a1b2c3d4",
  variant: "card",
});
```

The default origin is Cloudflare Images delivery:

```txt
https://imagedelivery.net/{accountHash}/{imageId}/{variant}
```

So the example above forms:

```txt
https://imagedelivery.net/account-hash/a1b2c3d4/card
```

## Use in app code

```ts
const avatarUrl = images.image_url({
  imageId: user.avatarImageId,
  variant: "thumbnail",
});

return Response.json({ avatarUrl });
```

Or in UI code:

```tsx
<img src={images.image_url({ imageId, variant: "hero" })} alt="Event hero" />
```

## Flexible variant URLs

Cloudflare Images can also serve hosted images with dynamic optimization parameters if flexible variants are enabled for the account.

```ts
const url = images.flexible_image_url({
  imageId: "a1b2c3d4",
  params: {
    w: 400,
    fit: "cover",
    sharpen: 3,
  },
});
```

This forms:

```txt
https://imagedelivery.net/account-hash/a1b2c3d4/w=400,fit=cover,sharpen=3
```

Common parameters such as `w`, `h`, `fit`, `dpr`, `quality`, `format`, `sharpen`, `blur`, `background`, and `anim` are typed, but additional Cloudflare optimization parameters can also be passed.

See Cloudflare's flexible variants reference: https://developers.cloudflare.com/images/optimization/hosted-images/enable-flexible-variants/

::: warning
Flexible variants must be enabled in Cloudflare Images before these URLs work. Cloudflare notes that flexible variants cannot be used for images that require signed delivery URLs.
:::

## Custom delivery origin

Pass `origin` when declaring variants if all URLs should use a custom domain.

Cloudflare's custom-domain delivery path is usually `/cdn-cgi/imagedelivery`:

```ts
export const images = defineVariants(
  "account-hash",
  [
    { name: "thumbnail" },
    { name: "hero" },
  ] as const,
  {
    origin: "https://images.example.com/cdn-cgi/imagedelivery",
  },
);

const url = images.image_url({
  imageId: "a1b2c3d4",
  variant: "hero",
});
```

This forms:

```txt
https://images.example.com/cdn-cgi/imagedelivery/account-hash/a1b2c3d4/hero
```

You can also override the origin per URL:

```ts
const previewUrl = images.image_url({
  imageId: "a1b2c3d4",
  variant: "hero",
  origin: "https://preview-images.example.com/cdn-cgi/imagedelivery",
});
```

See Cloudflare's custom-domain delivery reference: https://developers.cloudflare.com/images/optimization/hosted-images/serve-from-custom-domains/

If you use Transform Rules to rewrite a shorter path, pass that rewritten path as `origin` instead.

## Metadata

Variant declarations can carry your own metadata. The helper does not use it to build URLs, but keeping metadata beside the variant name can be useful for app-level rendering decisions.

Supported `metadata.fit` values:

| Fit option | Behavior |
| --- | --- |
| `scale-down` | The image is shrunk in size to fully fit within the given width or height, but will not be enlarged. |
| `contain` | The image is resized, shrunk or enlarged, to be as large as possible within the given width or height while preserving the aspect ratio. |
| `cover` | The image is resized to exactly fill the entire area specified by width and height and will be cropped if necessary. |
| `crop` | The image is shrunk and cropped to fit within the area specified by width and height. The image will not be enlarged. For images smaller than the given dimensions, it is the same as `scale-down`. For images larger than the given dimensions, it is the same as `cover`. |
| `pad` | The image is resized, shrunk or enlarged, to be as large as possible within the given width or height while preserving the aspect ratio. The extra area is filled with a background color, white by default. |

```ts
const images = defineVariants("account-hash", [
  {
    name: "thumbnail",
    metadata: {
      fit: "cover",
      width: 160,
      height: 160,
      usage: "avatars and small previews",
    },
  },
  {
    name: "hero",
    metadata: {
      fit: "cover",
      width: 1600,
      height: 900,
      usage: "landing pages",
    },
  },
] as const);
```

## Variant management

This helper only builds delivery URLs for hosted images. To create, update, or delete Cloudflare Images predefined variants in your account, use the Images Storage API client:

```ts
import createImagesStorageClient from "cloudflare-toys/images/storage";

const imagesApi = createImagesStorageClient({
  accountId: env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: env.CLOUDFLARE_API_TOKEN,
});

await imagesApi.variants.create({
  id: "hero",
  options: {
    fit: "cover",
    width: 1600,
    height: 900,
    metadata: "none",
  },
});
```
