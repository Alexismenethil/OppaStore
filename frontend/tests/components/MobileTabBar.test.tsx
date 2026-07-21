import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileTabBar } from "@/components/MobileTabBar";
import { CartProvider, useCart } from "@/features/cart/CartContext";
import { FavoritesProvider, useFavorites } from "@/features/favorites/FavoritesContext";
import { producto } from "../domain/fixtures";

const pathnameMock = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

function Controles() {
  const { agregar, abierto, cerrar } = useCart();
  const { alternar } = useFavorites();
  return (
    <>
      <button onClick={() => agregar(producto({ id: "p1", stock: 10 }), 2)}>agregar 2</button>
      <button onClick={() => alternar("p1")}>fav</button>
      <button onClick={cerrar}>cerrar drawer</button>
      <output data-testid="drawer">{abierto ? "abierto" : "cerrado"}</output>
    </>
  );
}

function renderTabBar() {
  return render(
    <CartProvider>
      <FavoritesProvider>
        <MobileTabBar />
        <Controles />
      </FavoritesProvider>
    </CartProvider>,
  );
}

const tabBar = () => screen.getByRole("navigation", { name: "Navegación inferior" });

describe("MobileTabBar (RNF01, RB15)", () => {
  beforeEach(() => {
    pathnameMock.mockReturnValue("/");
  });

  it("ofrece las cuatro pestañas de navegación tipo app", () => {
    renderTabBar();
    const barra = tabBar();
    expect(barra).toHaveTextContent("Inicio");
    expect(barra).toHaveTextContent("Catálogo");
    expect(barra).toHaveTextContent("Favoritos");
    expect(barra).toHaveTextContent("Carrito");
  });

  it("marca la pestaña activa según la ruta actual", () => {
    pathnameMock.mockReturnValue("/favoritos");
    renderTabBar();
    expect(screen.getByRole("link", { name: /Favoritos/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Inicio/ })).not.toHaveAttribute("aria-current");
  });

  it("considera activo el catálogo también en el detalle de producto", () => {
    pathnameMock.mockReturnValue("/catalogo?categoria=snacks");
    renderTabBar();
    expect(screen.getByRole("link", { name: /Catálogo/ })).toHaveAttribute("aria-current", "page");
  });

  it("el botón de carrito abre el drawer desde móvil", async () => {
    renderTabBar();
    await userEvent.click(tabBar().querySelector("button[aria-label='Carrito']")!);
    expect(screen.getByTestId("drawer")).toHaveTextContent("abierto");
  });

  it("muestra el contador de unidades del carrito y el de favoritos", async () => {
    renderTabBar();
    const user = userEvent.setup();
    expect(tabBar().textContent).not.toMatch(/\d/);

    await user.click(screen.getByRole("button", { name: "agregar 2" }));
    expect(tabBar().querySelector("button[aria-label='Carrito']")).toHaveTextContent("2");

    await user.click(screen.getByRole("button", { name: "fav" }));
    expect(screen.getByRole("link", { name: /Favoritos/ })).toHaveTextContent("1");
  });

  it("con el drawer abierto ninguna pestaña de ruta queda resaltada visualmente", async () => {
    renderTabBar();
    const user = userEvent.setup();
    const inicio = () => screen.getByRole("link", { name: /Inicio/ });
    expect(inicio().querySelector("span.font-bold")).not.toBeNull();

    await user.click(tabBar().querySelector("button[aria-label='Carrito']")!);
    expect(inicio().querySelector("span.font-bold")).toBeNull();
    // El enlace sigue marcado como página actual para lectores de pantalla.
    expect(inicio()).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("button", { name: "cerrar drawer" }));
    expect(inicio().querySelector("span.font-bold")).not.toBeNull();
  });
});
