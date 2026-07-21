import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
    /**
     * Las pruebas de integración comparten una única base PostgreSQL (y
     * singletons como SiteConfig). Se ejecutan archivo por archivo para que el
     * resultado no dependa del orden ni del paralelismo.
     */
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/routes/**", "src/middleware/**", "src/lib/**"],
      exclude: [
        // Arranque del servidor: en pruebas se usa crearApp() directamente.
        "src/index.ts",
        // Instancia del cliente Prisma generado.
        "src/lib/prisma.ts",
        // Esquema, migraciones y semilla.
        "prisma/**",
      ],
      thresholds: {
        lines: 80,
        functions: 75,
        branches: 70,
        statements: 80,
      },
    },
  },
});
