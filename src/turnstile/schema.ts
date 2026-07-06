import { createSchema } from "@better-fetch/fetch";
import * as v from "valibot";
import { formDataBody } from "../utils";

const turnstileErrorCode = v.picklist([
  "missing-input-secret",
  "invalid-input-secret",
  "missing-input-response",
  "invalid-input-response",
  "bad-request",
  "timeout-or-duplicate",
  "internal-error",
]);

const siteverifyInput = formDataBody(
  v.object({
    secret: v.pipe(v.string(), v.minLength(1)),
    response: v.pipe(v.string(), v.minLength(1), v.maxLength(2048)),
    remoteip: v.optional(v.string()),
    idempotency_key: v.optional(v.pipe(v.string(), v.uuid())),
  }),
);

const siteverifyResponse = v.object({
  success: v.boolean(),
  challenge_ts: v.optional(v.string()),
  hostname: v.optional(v.string()),
  action: v.optional(v.string()),
  cdata: v.optional(v.string()),
  "error-codes": v.optional(v.array(turnstileErrorCode)),
  metadata: v.optional(
    v.object({
      ephemeral_id: v.optional(v.string()),
    }),
  ),
});

export { siteverifyInput, siteverifyResponse, turnstileErrorCode };

const _SCHEMA_ = createSchema({
  "@post/siteverify": {
    input: siteverifyInput,
    output: siteverifyResponse,
  },
});

export default _SCHEMA_;

export type SiteverifyOptions = {
  remoteip?: string;
  idempotency_key?: string;
};
export type TurnstileErrorCode = v.InferOutput<typeof turnstileErrorCode>;
export type TurnstileSiteverifyResponse = v.InferOutput<typeof siteverifyResponse>;
