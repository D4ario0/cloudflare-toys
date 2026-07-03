import type { ZodType } from "zod";

export const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export const formDataBody = <T extends ZodType<Record<string, unknown>>>(
  schema: T,
) =>
  schema.transform((value) => {
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
  });
