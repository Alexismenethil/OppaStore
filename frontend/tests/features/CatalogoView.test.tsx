import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatalogoView } from "@/features/catalog/CatalogoView";
import { renderConProviders } from "../utils";
import { producto } from "../domain/fixtures";
import type { Producto } from "@/domain/types";

const fetchProductosMock = vi.fn();
const searchParamsMock = { valor: new URLSearchParams() };

vi.mock("@/lib/api/products", () => ({
  fetchProductos: () => fetchProductosMock(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParamsMock.valor,
}));

const CATALOGO: Producto[] = [
  producto({ id: "1", slug: "serum", nombre: "Serum Centella", categoria: "skincare", precio: 92, stock: 20 }),
  producto({ id: "2", slug: "tonico", nombre: "Tónico Yuja", categoria: "skincare", precio: 65, stock: 8 }),
  producto({ id: "3", slug: "panda", nombre: "Peluche Panda", categoria: "peluches", precio: 45, stock: 4 }),
  producto({ id: "4", slug: "honey", nombre: "Snack Honey Butter", categoria: "snacks", precio: 12, stock: 0 }),
];

const conteo = () => screen.getByText(/producto\(s\)/);

describe("CatalogoView · integración catálogo (RF11–RF13)", () => {
  beforeEach(() => {
    fetchProductosMock.mockReset();
    searchParamsMock.valor = new URLSearchParams();
  });

  it("muestra el esqueleto mientras carga y luego la grilla", async () => {
    fetchProductosMock.mockResolvedValue(CATALOGO);
    const { container } = renderConProviders(<CatalogoView />);
    expect(container.querySelectorAll(".skeleton").length).toBeGreaterThan(0);

    await waitFor(() => expect(conteo()).toHaveTextContent("4 producto(s)"));
    expect(container.querySelectorAll(".skeleton")).toHaveLength(0);
  });

  it("CP02 · filtrar por categoría reduce la grilla (RF12)", async () => {
    fetchProductosMock.mockResolvedValue(CATALOGO);
    renderConProviders(<CatalogoView />);
    await waitFor(() => expect(conteo()).toHaveTextContent("4 producto(s)"));

    await userEvent.click(screen.getByRole("button", { name: "Skincare Coreano" }));
    await waitFor(() => expect(conteo()).toHaveTextContent("2 producto(s)"));
    // AnimatePresence mantiene las tarjetas salientes hasta terminar su animación.
    await waitFor(() => expect(screen.queryByText("Peluche Panda")).not.toBeInTheDocument());
    expect(screen.getByText("Serum Centella")).toBeInTheDocument();
  });

  it("CP03 · buscar por nombre filtra sin distinguir mayúsculas (RF13)", async () => {
    fetchProductosMock.mockResolvedValue(CATALOGO);
    renderConProviders(<CatalogoView />);
    await waitFor(() => expect(conteo()).toHaveTextContent("4 producto(s)"));

    await userEvent.type(screen.getByLabelText("Buscar productos"), "PANDA");
    await waitFor(() => expect(conteo()).toHaveTextContent("1 producto(s)"));
    expect(screen.getByText("Peluche Panda")).toBeInTheDocument();
  });

  it("combina categoría y búsqueda", async () => {
    fetchProductosMock.mockResolvedValue(CATALOGO);
    renderConProviders(<CatalogoView />);
    await waitFor(() => expect(conteo()).toHaveTextContent("4 producto(s)"));

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Skincare Coreano" }));
    await user.type(screen.getByLabelText("Buscar productos"), "yuja");
    await waitFor(() => expect(conteo()).toHaveTextContent("1 producto(s)"));
    expect(screen.getByText("Tónico Yuja")).toBeInTheDocument();
  });

  it("sin coincidencias muestra el estado vacío y 'Limpiar filtros' lo restablece", async () => {
    fetchProductosMock.mockResolvedValue(CATALOGO);
    renderConProviders(<CatalogoView />);
    await waitFor(() => expect(conteo()).toHaveTextContent("4 producto(s)"));

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Buscar productos"), "zzzz");
    expect(await screen.findByText(/no encontramos productos/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /limpiar filtros/i }));
    await waitFor(() => expect(conteo()).toHaveTextContent("4 producto(s)"));
    expect(screen.getByLabelText("Buscar productos")).toHaveValue("");
  });

  it("aplica la categoría recibida por ?categoria= al entrar desde el menú", async () => {
    searchParamsMock.valor = new URLSearchParams("categoria=peluches");
    fetchProductosMock.mockResolvedValue(CATALOGO);
    renderConProviders(<CatalogoView />);

    await waitFor(() => expect(conteo()).toHaveTextContent("1 producto(s)"));
    expect(screen.getByText("Peluche Panda")).toBeInTheDocument();
  });

  it("CP04 · agregar desde la grilla muestra la confirmación (RF17)", async () => {
    fetchProductosMock.mockResolvedValue(CATALOGO);
    renderConProviders(<CatalogoView />);
    await waitFor(() => expect(conteo()).toHaveTextContent("4 producto(s)"));

    const tarjeta = screen.getByText("Serum Centella").closest("article")!;
    await userEvent.click(within(tarjeta).getByRole("button", { name: "Agregar al carrito" }));
    expect(await screen.findByText(/"Serum Centella" agregado al carrito/)).toBeInTheDocument();
  });

  it("CP05 · el producto agotado no ofrece el botón de agregar (RB02)", async () => {
    fetchProductosMock.mockResolvedValue(CATALOGO);
    renderConProviders(<CatalogoView />);
    await waitFor(() => expect(conteo()).toHaveTextContent("4 producto(s)"));

    const tarjeta = screen.getByText("Snack Honey Butter").closest("article")!;
    expect(within(tarjeta).getByRole("button", { name: "Producto agotado" })).toBeDisabled();
  });

  it("CP06 · al llegar al stock avisa en lugar de seguir agregando (RB01)", async () => {
    fetchProductosMock.mockResolvedValue([
      producto({ id: "5", slug: "unico", nombre: "Último Peluche", categoria: "peluches", stock: 1 }),
    ]);
    renderConProviders(<CatalogoView />);
    await waitFor(() => expect(conteo()).toHaveTextContent("1 producto(s)"));

    const user = userEvent.setup();
    const agregar = screen.getByRole("button", { name: "Agregar al carrito" });
    await user.click(agregar);
    await user.click(agregar); // el segundo excede el stock
    expect(await screen.findByText(/Solo hay 1 unidad\(es\) disponible\(s\)/)).toBeInTheDocument();
  });

  it("CP12 · marcar favorito desde la grilla persiste el estado (RB08)", async () => {
    fetchProductosMock.mockResolvedValue(CATALOGO);
    renderConProviders(<CatalogoView />);
    await waitFor(() => expect(conteo()).toHaveTextContent("4 producto(s)"));

    const tarjeta = screen.getByText("Tónico Yuja").closest("article")!;
    const corazon = within(tarjeta).getByRole("button", { name: "Guardar en favoritos" });
    expect(corazon).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(corazon);
    await waitFor(() => expect(corazon).toHaveAttribute("aria-pressed", "true"));
  });

  it("RNF09 · si la API cae avisa que muestra el catálogo de ejemplo", async () => {
    fetchProductosMock.mockRejectedValue(new Error("backend caído"));
    renderConProviders(<CatalogoView />);

    expect(await screen.findByText(/catálogo de ejemplo/i)).toBeInTheDocument();
    expect(conteo()).toBeInTheDocument();
  });

  it("un catálogo vacío desde la API muestra el estado vacío", async () => {
    fetchProductosMock.mockResolvedValue([]);
    renderConProviders(<CatalogoView />);
    expect(await screen.findByText(/no encontramos productos/i)).toBeInTheDocument();
  });
});
