import { test, expect } from "@playwright/test";

test.describe("Catálogo (Sprint 1)", () => {
  test("CP02 · filtra por categoría", async ({ page }) => {
    await page.goto("/catalogo");
    await page.getByRole("button", { name: "Peluches Kawaii" }).click();
    await expect(page.getByText("Peluche Panda Premium")).toBeVisible();
    await expect(page.getByText("Serum Centella Asiatica")).toHaveCount(0);
  });

  test("CP03 · busca por nombre", async ({ page }) => {
    await page.goto("/catalogo");
    await expect(page.getByText("8 producto(s)")).toBeVisible();
    await page.getByLabel("Buscar productos").fill("panda");
    await expect(page.getByText("1 producto(s)")).toBeVisible();
    await expect(page.getByText("Peluche Panda Premium")).toBeVisible();
    await expect(page.getByText("Serum Centella Asiatica")).toHaveCount(0);
  });

  test("CP01 · el producto inactivo no aparece", async ({ page }) => {
    await page.goto("/catalogo");
    await expect(page.getByText(/descontinuada/i)).toHaveCount(0);
  });
});
