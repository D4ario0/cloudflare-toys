import type { GenericSchema } from "valibot";
import {
  array,
  literal,
  number,
  object,
  optional,
  pipe,
  string,
  transform,
  union,
  unknown,
} from "valibot";

export const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export const cloudflareResponseInfo = object({
  code: number(),
  message: string(),
  documentation_url: optional(string()),
  source: optional(
    object({
      pointer: optional(string()),
    }),
  ),
});

export type CFResponseInfo = {
  code: number;
  message: string;
  documentation_url?: string;
  source?: {
    pointer?: string;
  };
};

export type CFSuccessResponse<T> = {
  success: true;
  errors: CFResponseInfo[];
  messages: CFResponseInfo[];
  result: T;
};

export type CFErrorResponse = {
  success: false;
  errors: CFResponseInfo[];
  messages: CFResponseInfo[];
  result?: unknown;
};

export type CFResponse<T> = CFSuccessResponse<T> | CFErrorResponse;

export function isCFError(data: unknown): data is CFErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    data.success === false
  );
}

export const cloudflareResponse = <T extends GenericSchema>(result: T) =>
  union([
    object({
      errors: array(cloudflareResponseInfo),
      messages: array(cloudflareResponseInfo),
      result,
      success: literal(true),
    }),
    object({
      errors: array(cloudflareResponseInfo),
      messages: array(cloudflareResponseInfo),
      result: optional(unknown()),
      success: literal(false),
    }),
  ]);

export const formDataBody = <T extends GenericSchema<Record<string, unknown>>>(
  schema: T,
) =>
  pipe(
    schema,
    transform((value) => {
      const formData = new FormData();

      for (const [key, fieldValue] of Object.entries(value)) {
        switch (true) {
          case fieldValue === undefined:
            break;
          case typeof Blob !== "undefined" && fieldValue instanceof Blob:
            formData.set(key, fieldValue);
            break;
          case fieldValue instanceof Date:
            formData.set(key, fieldValue.toISOString());
            break;
          case typeof fieldValue === "string":
            formData.set(key, fieldValue);
            break;
          case typeof fieldValue === "number":
          case typeof fieldValue === "boolean":
            formData.set(key, String(fieldValue));
            break;
          default:
            formData.set(key, JSON.stringify(fieldValue));
        }
      }

      return formData;
    }),
  );
