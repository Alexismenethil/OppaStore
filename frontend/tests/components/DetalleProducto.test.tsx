import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DetalleProducto, ProductoDetalle } from "@/features/catalog/ProductoDetalle";
import { renderConProviders } from "../utils";
import { producto } from "../domain/fixtures";

const fetchProductoMock = vi.fn();

vi.mock("@/lib/api/products", () => ({
  fetchProducto: (...a: unknown[]) => fetchProductoMock(...a),
}));

beforeEach(() => {
  fetchProductoMock.mockReset();
});

describe("DetalleProducto (RF18–RF21)", () => {
  it("RF18 · muestra nombre, precio y disponibilidad", () => {
    renderConProviders(
      <DetalleProducto producto={producto({ nombre: "Serum Glow", precio: 92, stock: 8 })} />,
    );
    expect(screen.getByRole("heading", { name: "Serum Glow" })).toBeInTheDocument();
    expect(screen.getByText("S/ 92.00")).toBeInTheDocument();
    expect(screen.getByTestId("disponibilidad")).toHaveTextContent("8 unidad(es) disponible(s)");
  });

  it("CP06 · el selector de cantidad no supera el stock (RF21, RB01, RB07)", async () => {
    renderConProviders(<DetalleProducto producto={producto({ stock: 2 })} />);
    const mas = screen.getByRole("button", { name: /aumentar cantidad/i });
    expect(screen.getByRole("button", { name: /disminuir cantidad/i })).toBeDisabled(); // arranca en 1
    await userEvent.click(mas); // -> 2
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("2");
    expect(mas).toBeDisabled(); // no supera el stock
  });

  it("CP05 · producto agotado: sin selector y botón 'Agotado' deshabilitado", () => {
    renderConProviders(<DetalleProducto producto={producto({ stock: 0 })} />);
    expect(screen.getByRole("button", { name: /producto agotado/i })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /aumentar cantidad/i })).not.toBeInTheDocument();
  });

  it("CP04 · agregar al carrito muestra confirmación (RF20)", async () => {
    renderConProviders(<DetalleProducto producto={producto({ nombre: "Tónico", stock: 5 })} />);
    await userEvent.click(screen.getByRole("button", { name: /agregar al carrito/i }));
    expect(await screen.findByText(/agregado al carrito/i)).toBeInTheDocument();
  });

  it("CP06 · agregar más unidades de las que quedan avisa el motivo (RB01)", async () => {
    renderConProviders(<DetalleProducto producto={producto({ nombre: "Tónico", stock: 1 })} />);
    const user = userEvent.setup();
    const agregar = screen.getByRole("button", { name: /agregar al carrito/i });
    await user.click(agregar);
    await user.click(agregar); // el carrito ya tiene la única unidad
    expect(await screen.findByText(/Solo hay 1 unidad\(es\) disponible\(s\)/)).toBeInTheDocument();
  });

  it("CP12 · el corazón alterna favorito y lo confirma con un aviso (RB08)", async () => {
    renderConProviders(<DetalleProducto producto={producto({ id: "p1", stock: 5 })} />);
    const user = userEvent.setup();
    const corazon = screen.getByRole("button", { name: /guardar en favoritos/i });
    expect(corazon).toHaveAttribute("aria-pressed", "false");

    await user.click(corazon);
    expect(await screen.findByText(/agregado a favoritos/i)).toBeInTheDocument();

    const quitar = screen.getByRole("button", { name: /quitar de favoritos/i });
    expect(quitar).toHaveAttribute("aria-pressed", "true");
    await user.click(quitar);
    expect(await screen.findByText(/quitado de favoritos/i)).toBeInTheDocument();
  });

  it("CP05 · un producto agotado muestra solo la etiqueta, sin unidades disponibles", () => {
    renderConProviders(<DetalleProducto producto={producto({ stock: 0 })} />);
    expect(screen.getByTestId("disponibilidad")).toHaveTextContent("Agotado");
    expect(screen.getByTestId("disponibilidad")).not.toHaveTextContent("disponible(s)");
  });

  it("CP10 · una preventa con stock se puede comprar y muestra su etiqueta (RB03)", () => {
    renderConProviders(<DetalleProducto producto={producto({ stock: 4, esPreventa: true })} />);
    expect(screen.getByTestId("status-badge")).toHaveTextContent("Preventa");
    expect(screen.getByTestId("disponibilidad")).toHaveTextContent("Preventa · 4 unidad(es)");
    expect(screen.getByRole("button", { name: /agregar al carrito/i })).toBeEnabled();
  });

  it("muestra el nombre legible de la categoría y el precio en soles (RB18)", () => {
    renderConProviders(<DetalleProducto producto={producto({ categoria: "peluches", precio: 45 })} />);
    expect(screen.getByText("Peluches Kawaii")).toBeInTheDocument();
    expect(screen.getByText("S/ 45.00")).toBeInTheDocument();
  });

  it("una categoría desconocida se muestra tal cual (respaldo)", () => {
    renderConProviders(<DetalleProducto producto={producto({ categoria: "otra-cosa" })} />);
    expect(screen.getByText("otra-cosa")).toBeInTheDocument();
  });
});

describe("DetalleProducto · galería (RF18)", () => {
  const conGaleria = producto({
    nombre: "K-Beauty Box",
    stock: 5,
    imagenUrl: "https://cdn/1.jpg",
    imagenes: ["https://cdn/1.jpg", "https://cdn/2.jpg", "https://cdn/3.jpg"],
  });

  it("sin galería no muestra miniaturas ni flechas", () => {
    renderConProviders(<DetalleProducto producto={producto({ imagenUrl: "https://cdn/1.jpg" })} />);
    expect(screen.queryByRole("button", { name: /ver foto 2/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /foto siguiente/i })).not.toBeInTheDocument();
  });

  it("deduplica la portada cuando ya está dentro de la galería", () => {
    renderConProviders(<DetalleProducto producto={conGaleria} />);
    // 3 imágenes únicas, no 4 (portada + galería).
    expect(screen.getAllByRole("button", { name: /ver foto \d de/i })).toHaveLength(3);
  });

  it("las flechas avanzan y vuelven en ciclo", async () => {
    renderConProviders(<DetalleProducto producto={conGaleria} />);
    const user = userEvent.setup();
    const activa = () =>
      screen.getAllByRole("button", { name: /ver foto \d de/i }).findIndex((b) =>
        b.hasAttribute("aria-current"),
      );

    expect(activa()).toBe(0);
    await user.click(screen.getByRole("button", { name: /foto siguiente/i }));
    expect(activa()).toBe(1);

    await user.click(screen.getByRole("button", { name: /foto anterior/i }));
    expect(activa()).toBe(0);

    await user.click(screen.getByRole("button", { name: /foto anterior/i })); // da la vuelta
    expect(activa()).toBe(2);
  });

  it("pulsar una miniatura selecciona esa foto", async () => {
    renderConProviders(<DetalleProducto producto={conGaleria} />);
    await userEvent.click(screen.getByRole("button", { name: /ver foto 3 de/i }));
    expect(screen.getByRole("button", { name: /ver foto 3 de/i })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("abre el visor a pantalla completa y lo cierra con Escape", async () => {
    renderConProviders(<DetalleProducto producto={conGaleria} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /abrir galería de k-beauty box/i }));
    const visor = await screen.findByRole("dialog", { name: /galería de k-beauty box/i });
    expect(within(visor).getByText("1 / 3")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: /galería/i })).not.toBeInTheDocument(),
    );
  });

  it("dentro del visor las flechas del teclado cambian de foto", async () => {
    renderConProviders(<DetalleProducto producto={conGaleria} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /abrir galería/i }));
    const visor = await screen.findByRole("dialog", { name: /galería/i });

    await user.keyboard("{ArrowRight}");
    expect(within(visor).getByText("2 / 3")).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}");
    expect(within(visor).getByText("1 / 3")).toBeInTheDocument();
  });

  it("el botón de cerrar del visor también lo cierra", async () => {
    renderConProviders(<DetalleProducto producto={conGaleria} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /abrir galería/i }));
    const visor = await screen.findByRole("dialog", { name: /galería/i });

    await user.click(within(visor).getByRole("button", { name: /cerrar galería/i }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: /galería/i })).not.toBeInTheDocument(),
    );
  });
});

describe("ProductoDetalle · estados de carga y 404 (RF18, RB10)", () => {
  it("muestra el esqueleto mientras resuelve el slug", () => {
    fetchProductoMock.mockReturnValue(new Promise(() => {}));
    const { container } = renderConProviders(<ProductoDetalle slug="serum" />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("muestra el detalle cuando el producto existe", async () => {
    fetchProductoMock.mockResolvedValue(producto({ slug: "serum", nombre: "Serum Glow" }));
    renderConProviders(<ProductoDetalle slug="serum" />);
    expect(await screen.findByRole("heading", { name: "Serum Glow" })).toBeInTheDocument();
  });

  it("RB10 · un producto inexistente o inactivo muestra el estado 404", async () => {
    fetchProductoMock.mockResolvedValue(null);
    renderConProviders(<ProductoDetalle slug="slug-inventado" />);
    expect(await screen.findByText(/producto no encontrado/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ir al catálogo/i })).toHaveAttribute(
      "href",
      "/catalogo",
    );
  });
});
