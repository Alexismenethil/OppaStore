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
      /**
       * Alcance medido (RNF13). Además del dominio se miden los componentes de
       * UI con comportamiento, los clientes de API y los módulos testeables de
       * features (contextos, checkout, hooks de catálogo).
       */
      include: [
        "src/domain/**",
        "src/components/**",
        "src/lib/**",
        "src/features/cart/**",
        "src/features/favorites/**",
        "src/features/config/**",
        "src/features/checkout/**",
        "src/features/catalog/**",
      ],
      exclude: [
        // Solo declaraciones de tipos (sin código ejecutable).
        "src/domain/types.ts",
        // Configuración/entorno, sin lógica propia.
        "src/lib/config.ts",
      ],
      thresholds: {
        lines: 85,
        functions: 80,
        branches: 75,
        statements: 85,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
