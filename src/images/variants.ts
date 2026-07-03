import { trimTrailingSlash } from "../utils";

const DEFAULT_ORIGIN = "https://imagedelivery.net" as const;

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
  { origin = DEFAULT_ORIGIN }: DefineVariantsOptions = {},
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
