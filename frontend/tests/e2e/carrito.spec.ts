import { test, expect, type Page } from "@playwright/test";

/**
 * Flujos críticos del carrito y del checkout (CP04–CP09, CP15, CP22).
 *
 * Se ejecutan en el proyecto `desktop`: usan la cabecera fija para reabrir el
 * carrito, que en móvil se reemplaza por la barra inferior (CP13 cubre ese
 * layout aparte). No dependen de servicios externos: no se pulsa "Enviar pedido"
 * (que abriría WhatsApp) ni se cargan imágenes remotas para las aserciones.
 */
test.describe("Carrito y checkout (Sprint 2)", () => {
  test.skip(
    ({ isMobile }) => Boolean(isMobile),
    "Flujo verificado en desktop; el layout móvil se cubre en CP13.",
  );

  /** Botón "Carrito" de la cabecera de escritorio. */
  const botonCarrito = (page: Page) =>
    page.getByRole("banner").getByRole("button", { name: "Carrito" }).first();

  const carrito = (page: Page) => page.getByRole("dialog", { name: "Carrito de compras" });

  /** Abre el detalle de un producto y lo agrega: el drawer se abre solo (RF20). */
  async function agregarDesdeDetalle(page: Page, slug: string) {
    await page.goto(`/producto/${slug}`);
    await page.getByRole("button", { name: "Agregar al carrito" }).click();
    await expect(carrito(page)).toBeVisible();
  }

  test("CP05 · un producto agotado no se puede agregar", async ({ page }) => {
    await page.goto("/catalogo");
    await page.getByLabel("Buscar productos").fill("honey butter");
    await expect(page.getByText("1 producto(s)")).toBeVisible();

    const tarjeta = page.getByRole("article").first();
    await expect(tarjeta.getByTestId("status-badge")).toHaveText("Agotado");
    await expect(tarjeta.getByRole("button", { name: "Producto agotado" })).toBeDisabled();
    await expect(tarjeta.getByRole("button", { name: "Agregar al carrito" })).toHaveCount(0);
  });

  test("CP05 · el detalle de un producto agotado tampoco permite comprar", async ({ page }) => {
    await page.goto("/producto/snack-honey-butter");
    await expect(page.getByRole("button", { name: "Producto agotado" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Agregar al carrito" })).toHaveCount(0);
  });

  test("CP04 · agregar un producto abre el carrito con su línea y su total", async ({ page }) => {
    await agregarDesdeDetalle(page, "peluche-panda-premium");

    await expect(carrito(page).getByText("Peluche Panda Premium")).toBeVisible();
    await expect(carrito(page).getByTestId("total-carrito")).toHaveText("S/ 45.00");
    await expect(botonCarrito(page)).toContainText("1");
  });

  test("CP07 · modificar la cantidad recalcula el total al instante", async ({ page }) => {
    await agregarDesdeDetalle(page, "peluche-panda-premium");
    const panel = carrito(page);

    await expect(panel.getByRole("button", { name: /Disminuir cantidad/ })).toBeDisabled(); // RB07
    await panel.getByRole("button", { name: /Aumentar cantidad/ }).click();
    await expect(panel.getByTestId("total-carrito")).toHaveText("S/ 90.00");

    await panel.getByRole("button", { name: /Disminuir cantidad/ }).click();
    await expect(panel.getByTestId("total-carrito")).toHaveText("S/ 45.00");
  });

  test("CP08 · eliminar el producto deja el carrito vacío", async ({ page }) => {
    await agregarDesdeDetalle(page, "peluche-panda-premium");
    const panel = carrito(page);

    await panel.getByRole("button", { name: "Eliminar" }).click();
    await expect(panel.getByText("Tu carrito está vacío 🐼")).toBeVisible();
    await expect(panel.getByTestId("total-carrito")).toHaveCount(0);
  });

  test("CP06 · no se puede superar el stock disponible (RB01)", async ({ page }) => {
    // "Pack de Snacks & Food Coreanos" tiene 3 unidades en el seed.
    await page.goto("/producto/pack-snacks-coreanos");
    const aumentar = page.getByRole("button", { name: "Aumentar cantidad" });
    await aumentar.click();
    await aumentar.click();
    await expect(page.getByLabel("Cantidad", { exact: true })).toHaveText("3");
    await expect(aumentar).toBeDisabled();

    await page.getByRole("button", { name: "Agregar al carrito" }).click();
    const panel = carrito(page);
    await expect(panel.getByRole("button", { name: /Aumentar cantidad/ })).toBeDisabled();
    await expect(panel.getByText("Solo 3 disponible(s)")).toBeVisible();
  });

  test("CP09 · el checkout valida los datos antes de generar el pedido (RF27, RB16)", async ({
    page,
  }) => {
    await agregarDesdeDetalle(page, "peluche-panda-premium");
    const panel = carrito(page);

    await panel.getByRole("button", { name: "Continuar" }).click();
    await expect(panel.getByLabel("Tu nombre")).toBeVisible();

    // Sin nombre no avanza.
    await panel.getByRole("button", { name: "Enviar pedido por WhatsApp" }).click();
    await expect(panel.getByText("Ingresa tu nombre (mínimo 2 caracteres).")).toBeVisible();

    // Con delivery se exige además el destino nacional.
    await panel.getByLabel("Tu nombre").fill("Ana Quispe");
    await panel.getByRole("radio", { name: /Delivery/ }).click();
    await panel.getByRole("button", { name: "Enviar pedido por WhatsApp" }).click();
    await expect(panel.getByText("Selecciona una provincia de la lista.")).toBeVisible();
    await expect(panel.getByText("Selecciona un distrito de la lista.")).toBeVisible();
    await expect(panel.getByText("Indica una dirección o agencia de transporte.")).toBeVisible();
  });

  test("RF27 · el destino se completa desde la lista de provincias y distritos", async ({ page }) => {
    await agregarDesdeDetalle(page, "peluche-panda-premium");
    const panel = carrito(page);

    await panel.getByRole("button", { name: "Continuar" }).click();
    await panel.getByLabel("Tu nombre").fill("Ana Quispe");
    await panel.getByRole("radio", { name: /Delivery/ }).click();

    await expect(panel.getByLabel("Distrito")).toBeDisabled(); // primero la provincia
    await panel.getByLabel("Provincia / ciudad").fill("aya");
    await panel.getByRole("option", { name: "Ayacucho", exact: true }).click();

    await expect(panel.getByLabel("Distrito")).toBeEnabled();
    await panel.getByLabel("Distrito").fill("naz");
    await panel.getByRole("option", { name: "Jesús Nazareno" }).click();
    await expect(panel.getByLabel("Distrito")).toHaveValue("Jesús Nazareno");

    // El botón final abre WhatsApp; no se pulsa para no depender del servicio externo.
    await expect(panel.getByRole("button", { name: "Enviar pedido por WhatsApp" })).toBeEnabled();
  });

  test("volver del checkout conserva el carrito", async ({ page }) => {
    await agregarDesdeDetalle(page, "peluche-panda-premium");
    const panel = carrito(page);

    await panel.getByRole("button", { name: "Continuar" }).click();
    await panel.getByRole("button", { name: "Volver al carrito" }).click();
    await expect(panel.getByTestId("total-carrito")).toHaveText("S/ 45.00");
  });

  test("CP22 · el carrito persiste tras recargar la página (RB17)", async ({ page }) => {
    await agregarDesdeDetalle(page, "peluche-panda-premium");
    await carrito(page).getByRole("button", { name: /Aumentar cantidad/ }).click();
    await expect(botonCarrito(page)).toContainText("2");

    await page.reload();
    await expect(botonCarrito(page)).toContainText("2");

    await botonCarrito(page).click();
    await expect(carrito(page).getByText("Peluche Panda Premium")).toBeVisible();
    await expect(carrito(page).getByTestId("total-carrito")).toHaveText("S/ 90.00");
  });

  test("el carrito persiste al navegar entre páginas", async ({ page }) => {
    await agregarDesdeDetalle(page, "peluche-panda-premium");
    await carrito(page).getByRole("button", { name: "Cerrar carrito" }).click();

    await page.goto("/catalogo");
    await expect(botonCarrito(page)).toContainText("1");
  });
});
