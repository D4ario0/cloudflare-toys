import { trimTrailingSlash } from "../utils";
import { IMAGE_DELIVERY_ORIGIN } from "../constants";

type Variant = {
  name: string;
  metadata?: Record<string, unknown>;
};

type VariantName<T extends readonly Variant[]> = T[number]["name"];

type DefineVariantsOptions = {
  origin?: string;
};

type ImageUrlOptions<T extends string> = {
  imageId: string;
  variant: T;
  origin?: string;
};

export function defineVariants<const T extends readonly Variant[]>(
  accountHash: string,
  variants: T,
  { origin = IMAGE_DELIVERY_ORIGIN }: DefineVariantsOptions = {},
) {
  return {
    variants,
    image_url({
      imageId,
      variant,
      origin: requestOrigin,
    }: ImageUrlOptions<VariantName<T>>) {
      return `${trimTrailingSlash(requestOrigin ?? origin)}/${accountHash}/${imageId}/${variant}`;
    },
  };
}
