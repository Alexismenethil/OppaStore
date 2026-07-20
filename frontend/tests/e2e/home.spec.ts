import { test, expect } from "@playwright/test";

test.describe("Home (Sprint 0)", () => {
  test("CP02 · muestra el titular de tendencias para la ciudad del visitante", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Tendencias asiáticas que llegan a tu ciudad" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tendencias asiáticas que llegan a Ayacucho" })).toHaveCount(0);
  });

  test("CP01 · muestra productos destacados activos", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Los más pedidos/i })).toBeVisible();
    await expect(page.getByText("Serum Centella Asiatica")).toBeVisible();
    // El producto inactivo (mascarilla descontinuada) no debe aparecer (RB10).
    await expect(page.getByText(/descontinuada/i)).toHaveCount(0);
  });

  test("CP04 · agregar al carrito incrementa el contador", async ({ page }) => {
    await page.goto("/");
    const agregar = page.getByRole("button", { name: /agregar al carrito/i }).first();
    await agregar.click();
    await expect(
      page.getByRole("banner").getByRole("button", { name: "Carrito" }),
    ).toContainText("1");
  });
});
