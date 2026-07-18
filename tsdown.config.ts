import { defineConfig } from "tsdown";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  sourcemap: false,
  clean: true,
  deps: {
    alwaysBundle: [/.*/],
    neverBundle: ["proxy-agent"],
  },
});
