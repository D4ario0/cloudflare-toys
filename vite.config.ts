export default {
  build: {
    outDir: "dist",
    sourcemap: false,
    emptyOutDir: true,
    lib: {
      entry: {
        "images/index": "src/images/index.ts",
        "images/variants": "src/images/variants.ts",
        "turnstile/index": "src/turnstile/index.ts",
        "wae/index": "src/wae/index.ts",
        "misc/better-auth": "src/miscellaneous/better-auth.ts",
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["@better-fetch/fetch", "zod", "zod/mini"],
      output: {
        entryFileNames: "[name].js",
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    },
  },
};
