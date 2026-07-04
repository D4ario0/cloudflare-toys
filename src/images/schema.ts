import { createSchema } from "@better-fetch/fetch";
import * as z from "zod";
import { formDataBody } from "../utils";

const responseInfo = z.object({
  code: z.number(),
  message: z.string(),
  documentation_url: z.string().optional(),
  source: z
    .object({
      pointer: z.string().optional(),
    })
    .optional(),
});

const cloudflareResponse = <T extends z.ZodType>(result: T) =>
  z.object({
    errors: z.array(responseInfo),
    messages: z.array(responseInfo),
    result,
    success: z.literal(true),
  });

const image = z.object({
  id: z.string().optional(),
  creator: z.string().optional(),
  filename: z.string().optional(),
  meta: z.unknown().optional(),
  requireSignedURLs: z.boolean().optional(),
  uploaded: z.string().optional(),
  variants: z.array(z.string()).optional(),
  draft: z.boolean().optional(),
});

const imageListV1 = z.object({
  images: z.array(image).optional(),
});

const listImagesV1Query = z
  .object({
    creator: z.string().optional(),
    page: z.number().int().positive().optional(),
    per_page: z.number().int().positive().max(100).optional(),
  })
  .optional();

const imageListV2 = z.object({
  continuation_token: z.string().optional(),
  images: z.array(image).optional(),
});

const listImagesV2Query = z
  .object({
    continuation_token: z.string().optional(),
    creator: z.string().optional(),
    meta: z.record(z.string(), z.string()).optional(),
    per_page: z.number().int().positive().max(1000).optional(),
    sort_order: z.enum(["asc", "desc"]).optional(),
  })
  .optional();

const keyList = z.object({
  keys: z
    .array(
      z.object({
        name: z.string().optional(),
        value: z.string().optional(),
      }),
    )
    .optional(),
});

const uploadImageInput = formDataBody(
  z
    .object({
      file: z
        .custom<Blob>(
          (value) => typeof Blob !== "undefined" && value instanceof Blob,
        )
        .optional(),
      url: z.url().optional(),
      id: z.string().optional(),
      metadata: z.unknown().optional(),
      requireSignedURLs: z.boolean().optional(),
    })
    .refine((value) => Boolean(value.file) !== Boolean(value.url), {
      message: "Expected exactly one of file or url.",
    }),
);

const directUploadInput = formDataBody(
  z
    .object({
      id: z.string().optional(),
      expiry: z.union([z.string(), z.date()]).optional(),
      metadata: z.unknown().optional(),
      requireSignedURLs: z.boolean().optional(),
    })
    .refine((value) => !(value.id && value.requireSignedURLs), {
      message: "Custom IDs cannot be used with requireSignedURLs.",
    }),
);

const updateImageInput = z.object({
  creator: z.string().optional(),
  metadata: z.unknown().optional(),
  requireSignedURLs: z.boolean().optional(),
});

const variantOptions = z.object({
  fit: z.enum(["scale-down", "contain", "cover", "crop", "pad"]),
  height: z.number().int().positive(),
  metadata: z.enum(["keep", "copyright", "none"]),
  width: z.number().int().positive(),
});

const variant = z.object({
  id: z.string(),
  options: variantOptions,
  neverRequireSignedURLs: z.boolean().optional(),
});

const variantMap = z.record(z.string(), variant);

const variantResponse = z.object({
  variant: variant.optional(),
});

const createVariantInput = z.object({
  id: z.string(),
  options: variantOptions,
  neverRequireSignedURLs: z.boolean().optional(),
});

const updateVariantInput = z.object({
  options: variantOptions,
  neverRequireSignedURLs: z.boolean().optional(),
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
    output: cloudflareResponse(z.unknown()),
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
      z.object({
        count: z
          .object({
            allowed: z.number().optional(),
            current: z.number().optional(),
          })
          .optional(),
      }),
    ),
  },
  "@get/v1/variants": {
    output: cloudflareResponse(
      z.object({
        variants: variantMap.optional(),
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
    output: cloudflareResponse(z.unknown()),
  },
  "@get/v1/:image_id/blob": {},
  "@get/v2": {
    query: listImagesV2Query,
    output: cloudflareResponse(imageListV2),
  },
  "@post/v2/direct_upload": {
    input: directUploadInput,
    output: cloudflareResponse(
      z.object({
        id: z.string().optional(),
        uploadURL: z.string().optional(),
      }),
    ),
  },
});

export default _SCHEMA_;

export type ListImagesOptions = z.input<typeof listImagesV1Query>;
export type ListImagesV2Options = z.input<typeof listImagesV2Query>;
export type UploadImageOptions = z.input<typeof uploadImageInput>;
export type UpdateImageOptions = z.input<typeof updateImageInput>;
export type DirectUploadOptions = z.input<typeof directUploadInput>;
export type CreateVariantOptions = z.input<typeof createVariantInput>;
export type UpdateVariantOptions = z.input<typeof updateVariantInput>;
