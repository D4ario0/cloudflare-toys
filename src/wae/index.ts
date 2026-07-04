import { createFetch } from "@better-fetch/fetch";
import { CLOUDFLARE_ORIGIN } from "../constants";
import { trimTrailingSlash } from "../utils";
import _SCHEMA_ from "./schema";

type WAEOptions = {
  accountId: string;
  apiToken: string;
  origin?: string;
};

interface WAESQLExpression {
  toSQL(): string;
}

export default function createWAEClient({
  accountId,
  apiToken,
  origin = CLOUDFLARE_ORIGIN,
}: WAEOptions) {
  const $fetch = createFetch({
    baseURL: `${trimTrailingSlash(origin)}/accounts/${accountId}/analytics_engine`,
    auth: { type: "Bearer", token: apiToken },
    schema: _SCHEMA_,
  });

  return {
    query: (expr: string | WAESQLExpression) =>
      $fetch("@post/sql", {
        body: typeof expr === "string" ? expr : expr.toSQL(),
      }),
  };
}
