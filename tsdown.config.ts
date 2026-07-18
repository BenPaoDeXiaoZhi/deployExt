import { defineConfig } from "tsdown";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  sourcemap: false,
  clean: true,
  deps: {
    alwaysBundle: [
      "axios",
      "@actions/core",
      "@ccw-api/api",
      "ali-oss",
      "crypto-js",
      "jszip",
      "@ccw-api/teamwork",
    ],
    neverBundle: ["proxy-agent"],
    
  },
});
