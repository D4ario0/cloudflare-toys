import zodCompiler from "zod-compiler/vite";

export default {
  plugins: [
    zodCompiler({
      apply: "build",
      include: ["src/**/*.ts"],
      output: "compact",
    }),
  ],
  build: {
    outDir: "dist",
    sourcemap: true,
    emptyOutDir: false,
    lib: {
      entry: {
        "images/index": "src/images/index.ts",
        "images/variants": "src/images/variants.ts",
        "wae/index": "src/wae/index.ts",
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
