import { createSchema } from "@better-fetch/fetch";
import * as v from "valibot";
import { cloudflareResponse, formDataBody } from "../utils";

const image = v.object({
  id: v.optional(v.string()),
  creator: v.optional(v.string()),
  filename: v.optional(v.string()),
  meta: v.optional(v.unknown()),
  requireSignedURLs: v.optional(v.boolean()),
  uploaded: v.optional(v.string()),
  variants: v.optional(v.array(v.string())),
  draft: v.optional(v.boolean()),
});

const imageListV1 = v.object({
  images: v.optional(v.array(image)),
});

const listImagesV1Query = v.optional(
  v.object({
    creator: v.optional(v.string()),
    page: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
    per_page: v.optional(
      v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)),
    ),
  }),
);

const imageListV2 = v.object({
  continuation_token: v.optional(v.string()),
  images: v.optional(v.array(image)),
});

const listImagesV2Query = v.optional(
  v.object({
    continuation_token: v.optional(v.string()),
    creator: v.optional(v.string()),
    meta: v.optional(v.record(v.string(), v.string())),
    per_page: v.optional(
      v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(1000)),
    ),
    sort_order: v.optional(v.picklist(["asc", "desc"])),
  }),
);

const keyList = v.object({
  keys: v.optional(
    v.array(
      v.object({
        name: v.optional(v.string()),
        value: v.optional(v.string()),
      }),
    ),
  ),
});

const uploadImageObject = v.object({
  file: v.optional(
    v.custom<Blob>(
      (value) => typeof Blob !== "undefined" && value instanceof Blob,
    ),
  ),
  url: v.optional(v.pipe(v.string(), v.url())),
  id: v.optional(v.string()),
  metadata: v.optional(v.unknown()),
  requireSignedURLs: v.optional(v.boolean()),
});

const uploadImageInput = formDataBody(
  v.pipe(
    uploadImageObject,
    v.check(
      (value) => Boolean(value.file) !== Boolean(value.url),
      "Expected exactly one of file or url.",
    ),
  ),
);

const directUploadObject = v.object({
  id: v.optional(v.string()),
  expiry: v.optional(v.union([v.string(), v.date()])),
  metadata: v.optional(v.unknown()),
  requireSignedURLs: v.optional(v.boolean()),
});

const directUploadInput = formDataBody(
  v.pipe(
    directUploadObject,
    v.check(
      (value) => !(value.id && value.requireSignedURLs),
      "Custom IDs cannot be used with requireSignedURLs.",
    ),
  ),
);

const updateImageInput = v.object({
  creator: v.optional(v.string()),
  metadata: v.optional(v.unknown()),
  requireSignedURLs: v.optional(v.boolean()),
});

const variantOptions = v.object({
  fit: v.picklist(["scale-down", "contain", "cover", "crop", "pad"]),
  height: v.pipe(v.number(), v.integer(), v.minValue(1)),
  metadata: v.picklist(["keep", "copyright", "none"]),
  width: v.pipe(v.number(), v.integer(), v.minValue(1)),
});

const variant = v.object({
  id: v.string(),
  options: variantOptions,
  neverRequireSignedURLs: v.optional(v.boolean()),
});

const variantMap = v.record(v.string(), variant);

const variantResponse = v.object({
  variant: v.optional(variant),
});

const createVariantInput = v.object({
  id: v.string(),
  options: variantOptions,
  neverRequireSignedURLs: v.optional(v.boolean()),
});

const updateVariantInput = v.object({
  options: variantOptions,
  neverRequireSignedURLs: v.optional(v.boolean()),
});

export {
  createVariantInput,
  directUploadInput,
  image,
  imageListV1,
  imageListV2,
  keyList,
  listImagesV1Query,
  listImagesV2Query,
  updateImageInput,
  updateVariantInput,
  uploadImageInput,
  variant,
  variantOptions,
  variantResponse,
};

const _SCHEMA_ = createSchema({
  "@get/v1": {
    query: listImagesV1Query,
    output: cloudflareResponse(imageListV1),
  },
  "@get/v1/:image_id": {
    output: cloudflareResponse(image),
  },
  "@post/v1": {
    input: uploadImageInput,
    output: cloudflareResponse(image),
  },
  "@patch/v1/:image_id": {
    input: updateImageInput,
    output: cloudflareResponse(image),
  },
  "@delete/v1/:image_id": {
    output: cloudflareResponse(v.unknown()),
  },
  "@get/v1/keys": {
    output: cloudflareResponse(keyList),
  },
  "@put/v1/keys/:signing_key_name": {
    output: cloudflareResponse(keyList),
  },
  "@delete/v1/keys/:signing_key_name": {
    output: cloudflareResponse(keyList),
  },
  "@get/v1/stats": {
    output: cloudflareResponse(
      v.object({
        count: v.optional(
          v.object({
            allowed: v.optional(v.number()),
            current: v.optional(v.number()),
          }),
        ),
      }),
    ),
  },
  "@get/v1/variants": {
    output: cloudflareResponse(
      v.object({
        variants: v.optional(variantMap),
      }),
    ),
  },
  "@get/v1/variants/:variant_id": {
    output: cloudflareResponse(variantResponse),
  },
  "@post/v1/variants": {
    input: createVariantInput,
    output: cloudflareResponse(variantResponse),
  },
  "@patch/v1/variants/:variant_id": {
    input: updateVariantInput,
    output: cloudflareResponse(variantResponse),
  },
  "@delete/v1/variants/:variant_id": {
    output: cloudflareResponse(v.unknown()),
  },
  "@get/v1/:image_id/blob": {},
  "@get/v2": {
    query: listImagesV2Query,
    output: cloudflareResponse(imageListV2),
  },
  "@post/v2/direct_upload": {
    input: directUploadInput,
    output: cloudflareResponse(
      v.object({
        id: v.optional(v.string()),
        uploadURL: v.optional(v.string()),
      }),
    ),
  },
});

export default _SCHEMA_;

export type ListImagesOptions = v.InferInput<typeof listImagesV1Query>;
export type ListImagesV2Options = v.InferInput<typeof listImagesV2Query>;
export type UploadImageOptions = v.InferInput<typeof uploadImageObject>;
export type UpdateImageOptions = v.InferInput<typeof updateImageInput>;
export type DirectUploadOptions = v.InferInput<typeof directUploadObject>;
export type CreateVariantOptions = v.InferInput<typeof createVariantInput>;
export type UpdateVariantOptions = v.InferInput<typeof updateVariantInput>;
