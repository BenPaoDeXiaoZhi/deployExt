import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  splitting: false,
  sourcemap: false,
  clean: true,
  noExternal: [
    "axios",
    "@actions/core",
    "@ccw-api/api",
    "ali-oss",
    "crypto-js",
    "jszip",
  ],
  external: ["proxy-agent"],
});
