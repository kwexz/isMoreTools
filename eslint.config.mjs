import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // Tool previews render from Blob/object URLs and the app ships an unoptimized
      // static export, so the next/image optimizer cannot be used for them.
      "@next/next/no-img-element": "off"
    }
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "node_modules/**",
    "next-env.d.ts"
  ])
]);
