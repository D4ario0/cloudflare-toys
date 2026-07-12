import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "images/storage": "src/images/storage.ts",
    "images/variants": "src/images/variants.ts",
    "turnstile/index": "src/turnstile/index.ts",
    "wae/index": "src/wae/index.ts",
    "misc/better-auth/secondaryStorage":
      "src/miscellaneous/better-auth/secondaryStorage.ts",
    "misc/drizzle/cache": "src/miscellaneous/drizzle/cache.ts",
  },
  format: "esm",
  platform: "neutral",
  target: "es2022",
  dts: true,
  clean: true,
  sourcemap: false,
  deps: {
    alwaysBundle: ["@better-fetch/fetch", "valibot"],
    onlyBundle: ["@better-fetch/fetch", "valibot"],
    neverBundle: [/^better-auth(?:\/|$)/, /^drizzle-orm(?:\/|$)/],
  },
});
