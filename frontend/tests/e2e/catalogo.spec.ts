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

  test("CP03 · la búsqueda no distingue mayúsculas y se puede limpiar", async ({ page }) => {
    await page.goto("/catalogo");
    const buscador = page.getByLabel("Buscar productos");

    await buscador.fill("PANDA");
    await expect(page.getByText("1 producto(s)")).toBeVisible();

    await page.getByRole("button", { name: "Limpiar búsqueda" }).click();
    await expect(buscador).toHaveValue("");
    await expect(page.getByText("8 producto(s)")).toBeVisible();
  });

  test("CP02 · combinar categoría y búsqueda sin resultados ofrece limpiar filtros", async ({
    page,
  }) => {
    await page.goto("/catalogo");
    await page.getByRole("button", { name: "Peluches Kawaii" }).click();
    await page.getByLabel("Buscar productos").fill("serum");

    await expect(page.getByText("No encontramos productos con esos criterios 🥺")).toBeVisible();
    await page.getByRole("button", { name: "Limpiar filtros" }).click();
    await expect(page.getByText("8 producto(s)")).toBeVisible();
  });

  test("RF12 · entrar con ?categoria= aplica el filtro desde la URL", async ({ page }) => {
    await page.goto("/catalogo?categoria=snacks");
    await expect(page.getByText("2 producto(s)")).toBeVisible();
    await expect(page.getByText("Pack de Snacks & Food Coreanos")).toBeVisible();
    await expect(page.getByText("Peluche Panda Premium")).toHaveCount(0);
  });

  test("CP11 · las etiquetas de estado reflejan el stock (RB09, RB19)", async ({ page }) => {
    await page.goto("/catalogo");

    const pocasUnidades = page
      .getByRole("article")
      .filter({ hasText: "Pack de Snacks & Food Coreanos" });
    await expect(pocasUnidades.getByTestId("status-badge")).toHaveText("Pocas unidades");

    const agotado = page.getByRole("article").filter({ hasText: "Snack Coreano Honey Butter" });
    await expect(agotado.getByTestId("status-badge")).toHaveText("Agotado");
  });

  test("RF18 · desde el catálogo se llega al detalle del producto", async ({ page }) => {
    await page.goto("/catalogo");
    await page.getByRole("link", { name: "Ver Peluche Panda Premium" }).click();

    await expect(page).toHaveURL(/\/producto\/peluche-panda-premium$/);
    await expect(page.getByRole("heading", { name: "Peluche Panda Premium" })).toBeVisible();
    await expect(page.getByTestId("disponibilidad")).toContainText("unidad(es) disponible(s)");
  });
});
