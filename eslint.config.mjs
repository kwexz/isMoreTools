import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // Intentional hydration-safe pattern: theme and URL query are read after mount.
      "react-hooks/set-state-in-effect": "warn"
    }
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "node_modules/**",
    "next-env.d.ts"
  ])
]);
