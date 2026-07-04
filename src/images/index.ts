import { createFetch } from "@better-fetch/fetch";
import type { z } from "zod";
import { CLOUDFLARE_ORIGIN } from "../constants";
import { trimTrailingSlash } from "../utils";

import _SCHEMA_ from "./schema";
import type {
  ListImagesOptions,
  ListImagesV2Options,
  UploadImageOptions,
  UpdateImageOptions,
  DirectUploadOptions,
  CreateVariantOptions,
  UpdateVariantOptions,
} from "./schema";

type CFImagesOptions = {
  accountId: string;
  apiToken: string;
  origin?: string; // for testing purposes
};

export default function createImagesClient({
  accountId,
  apiToken,
  origin = CLOUDFLARE_ORIGIN,
}: CFImagesOptions) {
  const $fetch = createFetch({
    baseURL: `${trimTrailingSlash(origin)}/accounts/${accountId}/images`,
    auth: {
      type: "Bearer",
      token: apiToken,
    },
    schema: _SCHEMA_,
  });

  return {
    list: (query?: ListImagesOptions) => $fetch("@get/v1", { query }),
    listV2: (query?: ListImagesV2Options) => $fetch("@get/v2", { query }),
    get: (id: string) =>
      $fetch("@get/v1/:image_id", { params: { image_id: id } }),
    upload: (body: UploadImageOptions) => $fetch("@post/v1", { body }),
    update: (id: string, body: UpdateImageOptions) =>
      $fetch("@patch/v1/:image_id", { params: { image_id: id }, body }),
    delete: (id: string) =>
      $fetch("@delete/v1/:image_id", { params: { image_id: id } }),
    blob: (id: string) =>
      $fetch("@get/v1/:image_id/blob", { params: { image_id: id } }),
    stats: () => $fetch("@get/v1/stats"),
    keys: {
      list: () => $fetch("@get/v1/keys"),
      create: (name: string) =>
        $fetch("@put/v1/keys/:signing_key_name", {
          params: { signing_key_name: name },
        }),
      delete: (name: string) =>
        $fetch("@delete/v1/keys/:signing_key_name", {
          params: { signing_key_name: name },
        }),
    },
    variants: {
      list: () => $fetch("@get/v1/variants"),
      get: (id: string) =>
        $fetch("@get/v1/variants/:variant_id", { params: { variant_id: id } }),
      create: (body: CreateVariantOptions) =>
        $fetch("@post/v1/variants", { body }),
      update: (id: string, body: UpdateVariantOptions) =>
        $fetch("@patch/v1/variants/:variant_id", {
          params: { variant_id: id },
          body,
        }),
      delete: (id: string) =>
        $fetch("@delete/v1/variants/:variant_id", {
          params: { variant_id: id },
        }),
    },
    directUploads: {
      create: (body: DirectUploadOptions) =>
        $fetch("@post/v2/direct_upload", { body }),
    },
  };
}
