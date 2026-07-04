import { createFetch } from "@better-fetch/fetch";
import { TURNSTILE_ORIGIN } from "../constants";
import _SCHEMA_ from "./schema";
import type { SiteverifyOptions } from "./schema";

export const TURNSTILE_RESPONSE_FIELD = "cf-turnstile-response" as const;

type TurnstileOptions = {
  secret: string;
  origin?: string;
};

export default function createTurnstileClient({
  secret,
  origin = TURNSTILE_ORIGIN,
}: TurnstileOptions) {
  const $fetch = createFetch({
    baseURL: `${origin}/turnstile/v0`,
    schema: _SCHEMA_,
  });

  return {
    verify: (response: string, options?: SiteverifyOptions) =>
      $fetch("@post/siteverify", {
        body: {
          secret,
          response,
          remoteip: options?.remoteip,
          idempotency_key: options?.idempotency_key,
        },
      }),
  };
}

export type { SiteverifyOptions, TurnstileSiteverifyResponse } from "./schema";
