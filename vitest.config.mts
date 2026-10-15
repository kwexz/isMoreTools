import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolve the "@/*" alias straight from tsconfig.json.
    tsconfigPaths: true
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.tsx"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "out/**"]
  }
});
