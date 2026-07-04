import { createSchema } from "@better-fetch/fetch";
import * as z from "zod";

const _SCHEMA_ = createSchema({
  "@post/sql": {
    input: z.string().min(1),
    output: z.object({
      meta: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
        }),
      ),
      data: z.array(z.record(z.string(), z.unknown())),
      rows: z.number().int().nonnegative(),
    }),
  },
});

export default _SCHEMA_;
