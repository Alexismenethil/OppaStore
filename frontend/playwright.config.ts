import { defineConfig, devices } from "@playwright/test";

/** E2E de los flujos críticos (CP01, CP04, CP08, CP09, CP13, CP15…). */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // CP13: responsive móvil
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
