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
      external: ["better-auth"],
      output: {
        entryFileNames: (chunk) => {
          if (chunk.facadeModuleId?.includes("@better-fetch/fetch")) {
            return "vendor/better-fetch.js";
          }

          if (chunk.facadeModuleId?.includes("valibot")) {
            return "vendor/valibot.js";
          }

          return "[name].js";
        },
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    },
  },
};
