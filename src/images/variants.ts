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
  options?: DefineVariantsOptions,
) {
  const origin = options?.origin
    ? trimTrailingSlash(options.origin)
    : IMAGE_DELIVERY_ORIGIN;
  return {
    variants,
    image_url(options: ImageUrlOptions<VariantName<T>>) {
      return `${origin}/${accountHash}/${options.imageId}/${options.variant}`;
    },
  };
}
