import { createSchema } from "@better-fetch/fetch";
import * as z from "zod";
import { formDataBody } from "../utils";

const turnstileErrorCode = z.enum([
  "missing-input-secret",
  "invalid-input-secret",
  "missing-input-response",
  "invalid-input-response",
  "bad-request",
  "timeout-or-duplicate",
  "internal-error",
]);

const siteverifyInput = formDataBody(
  z.object({
    secret: z.string().min(1),
    response: z.string().min(1).max(2048),
    remoteip: z.string().optional(),
    idempotency_key: z.uuid().optional(),
  }),
);

const siteverifyResponse = z.object({
  success: z.boolean(),
  challenge_ts: z.string().optional(),
  hostname: z.string().optional(),
  action: z.string().optional(),
  cdata: z.string().optional(),
  "error-codes": z.array(turnstileErrorCode).optional(),
  metadata: z
    .object({
      ephemeral_id: z.string().optional(),
    })
    .optional(),
});

export { siteverifyInput, siteverifyResponse, turnstileErrorCode };

const _SCHEMA_ = createSchema({
  "@post/siteverify": {
    input: siteverifyInput,
    output: siteverifyResponse,
  },
});

export default _SCHEMA_;

export type SiteverifyOptions = Omit<
  z.input<typeof siteverifyInput>,
  "secret" | "response"
>;
export type TurnstileErrorCode = z.infer<typeof turnstileErrorCode>;
export type TurnstileSiteverifyResponse = z.infer<typeof siteverifyResponse>;
