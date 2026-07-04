import { createFetch } from "@better-fetch/fetch";
import { CLOUDFLARE_ORIGIN } from "../constants";
import _SCHEMA_ from "./schema";

type WAEOptions = {
  accountId: string;
  apiToken: string;
  origin?: string;
};

export default function createCFWAE({
  accountId,
  apiToken,
  origin = CLOUDFLARE_ORIGIN,
}: WAEOptions) {
  return createFetch({
    baseURL: `${origin}/accounts/${accountId}/analytics_engine`,
    auth: {
      type: "Bearer",
      token: apiToken,
    },
    schema: _SCHEMA_,
  });
}

const wae = createCFWAE({ accountId: "", apiToken: "" });
