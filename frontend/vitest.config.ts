import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    // Los E2E (Playwright) se ejecutan aparte con `npm run test:e2e`.
    exclude: ["node_modules/**", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/domain/**"],
      // types.ts solo contiene declaraciones de tipos (sin código ejecutable).
      exclude: ["src/domain/types.ts"],
      thresholds: {
        // RNF13: cobertura de la capa de dominio >= 80%
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
