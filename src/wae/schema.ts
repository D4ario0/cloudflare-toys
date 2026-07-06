import { createSchema } from "@better-fetch/fetch";
import * as v from "valibot";

const _SCHEMA_ = createSchema({
  "@post/sql": {
    input: v.pipe(v.string(), v.minLength(1)),
    output: v.object({
      meta: v.array(
        v.object({
          name: v.string(),
          type: v.string(),
        }),
      ),
      data: v.array(v.record(v.string(), v.unknown())),
      rows: v.pipe(v.number(), v.integer(), v.minValue(0)),
    }),
  },
});

export default _SCHEMA_;
