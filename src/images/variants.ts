import { trimTrailingSlash } from "../utils";
import { IMAGE_DELIVERY_ORIGIN } from "../constants";

export type ImageVariantFit =
  /**
   * Shrinks the image to fully fit within the given width or height, but never enlarges it.
   */
  | "scale-down"
  /**
   * Resizes the image, shrinking or enlarging it, to be as large as possible within the given width or height while preserving aspect ratio.
   */
  | "contain"
  /**
   * Resizes the image to exactly fill the entire area specified by width and height, cropping if necessary.
   */
  | "cover"
  /**
   * Shrinks and crops the image to fit within the specified width and height. Smaller images behave like scale-down; larger images behave like cover.
   */
  | "crop"
  /**
   * Resizes the image to be as large as possible within the given width or height while preserving aspect ratio. Extra area is filled with a background color, white by default.
   */
  | "pad";

export type VariantMetadata = {
  /** Cloudflare Images fit behavior for this variant. */
  fit?: ImageVariantFit;
  /** Intended variant width in pixels. */
  width?: number;
  /** Intended variant height in pixels. */
  height?: number;
} & Record<string, unknown>;

export type Variant = {
  name: string;
  metadata?: VariantMetadata;
};

type VariantName<T extends readonly Variant[]> = T[number]["name"];

type FlexibleVariantParamValue = string | number | boolean | undefined;

export type FlexibleVariantParams = {
  /** Width in pixels. Cloudflare's hosted-image flexible variant examples use `w`. */
  w?: number;
  /** Height in pixels. */
  h?: number;
  /** Fit behavior for the generated image. */
  fit?: ImageVariantFit;
  /** Device pixel ratio multiplier. */
  dpr?: number;
  /** Output quality. */
  quality?: number;
  /** Output format, for example `auto`, `webp`, `avif`, or `json`. */
  format?: string;
  /** Sharpen amount. */
  sharpen?: number;
  /** Blur radius. */
  blur?: number;
  /** Background color, often used with `fit=pad`. */
  background?: string;
  /** Whether to preserve animation frames. */
  anim?: boolean;
} & Record<string, FlexibleVariantParamValue>;

type DefineVariantsOptions = {
  origin?: string;
};

type ImageUrlOptions<T extends string> = {
  imageId: string;
  variant: T;
  origin?: string;
};

type FlexibleImageUrlOptions = {
  imageId: string;
  params: FlexibleVariantParams;
  origin?: string;
};

const flexibleVariant = (params: FlexibleVariantParams) =>
  Object.entries(params)
    .filter(
      (entry): entry is [
        string,
        Exclude<FlexibleVariantParamValue, undefined>,
      ] => entry[1] !== undefined,
    )
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join(",");

export function defineVariants<const T extends readonly Variant[]>(
  accountHash: string,
  variants: T,
  options?: DefineVariantsOptions,
) {
  const baseOrigin = options?.origin
    ? trimTrailingSlash(options.origin)
    : IMAGE_DELIVERY_ORIGIN;

  return {
    variants,
    image_url(options: ImageUrlOptions<VariantName<T>>) {
      const origin = options.origin
        ? trimTrailingSlash(options.origin)
        : baseOrigin;
      return `${origin}/${accountHash}/${options.imageId}/${options.variant}`;
    },
    flexible_image_url(options: FlexibleImageUrlOptions) {
      const origin = options.origin
        ? trimTrailingSlash(options.origin)
        : baseOrigin;
      return `${origin}/${accountHash}/${options.imageId}/${flexibleVariant(options.params)}`;
    },
  };
}
