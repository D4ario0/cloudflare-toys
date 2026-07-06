export default {
  build: {
    outDir: "dist",
    sourcemap: false,
    emptyOutDir: true,
    lib: {
      entry: {
        "images/storage": "src/images/storage.ts",
        "images/variants": "src/images/variants.ts",
        "turnstile/index": "src/turnstile/index.ts",
        "wae/index": "src/wae/index.ts",
        "misc/better-auth": "src/miscellaneous/better-auth.ts",
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["zod", "zod/mini", "better-auth"],
      output: {
        entryFileNames: (chunk) =>
          chunk.facadeModuleId?.includes("@better-fetch/fetch")
            ? "vendor/better-fetch.js"
            : "[name].js",
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    },
  },
};
