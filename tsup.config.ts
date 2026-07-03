import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  splitting: false,
  sourcemap: false,
  clean: true,
  noExternal: ["@actions/core", "@actions/github"],
});
