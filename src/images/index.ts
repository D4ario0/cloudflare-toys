import { createFetch } from "@better-fetch/fetch";
import { CLOUDFLARE_ORIGIN } from "../constants";
import _SCHEMA_ from "./schema";

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
  return createFetch({
    baseURL: `${origin}/accounts/${accountId}/images`,
    auth: {
      type: "Bearer",
      token: apiToken,
    },
    schema: _SCHEMA_,
  });
}
