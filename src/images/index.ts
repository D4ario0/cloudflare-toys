import { createFetch } from "@better-fetch/fetch";
import _SCHEMA_ from "./schema";

const CLOUDFLARE_ORIGIN = "https://api.cloudflare.com/client/v4" as const;

type CFImagesOptions = {
  accountId: string;
  apiToken: string;
  origin?: string; // for testing purposes
};

export default function createCFImages({
  accountId,
  apiToken,
  origin = CLOUDFLARE_ORIGIN,
}: CFImagesOptions) {
  return createFetch({
    baseURL: `${origin}/accounts/${accountId}/images`,
    auth: {
      type: "Bearer",
      token: apiToken,
    },
    schema: _SCHEMA_,
  });
}
