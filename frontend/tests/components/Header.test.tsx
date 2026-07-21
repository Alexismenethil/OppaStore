import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/Header";
import { CartProvider, useCart } from "@/features/cart/CartContext";
import { FavoritesProvider, useFavorites } from "@/features/favorites/FavoritesContext";
import { producto } from "../domain/fixtures";

const pathnameMock = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

/** Controles auxiliares para mover el estado global desde la prueba. */
function Controles() {
  const { agregar, cambiarCantidad, abierto } = useCart();
  const { alternar } = useFavorites();
  return (
    <>
      <button onClick={() => agregar(producto({ id: "p1", stock: 10 }), 1)}>agregar</button>
      <button onClick={() => agregar(producto({ id: "p2", stock: 10 }), 3)}>agregar 3</button>
      <button onClick={() => cambiarCantidad("p1", 5)}>subir p1</button>
      <button onClick={() => alternar("p1")}>fav p1</button>
      <button onClick={() => alternar("p2")}>fav p2</button>
      <output data-testid="drawer">{abierto ? "abierto" : "cerrado"}</output>
    </>
  );
}

function renderHeader() {
  return render(
    <CartProvider>
      <FavoritesProvider>
        <Header />
        <Controles />
      </FavoritesProvider>
    </CartProvider>,
  );
}

/** Botón "Carrito" de la barra de escritorio (el móvil no tiene texto). */
function botonCarrito() {
  return screen.getByRole("banner").querySelector<HTMLButtonElement>("nav button[aria-label='Carrito']")!;
}

describe("Header (RF01–RF05)", () => {
  beforeEach(() => {
    pathnameMock.mockReturnValue("/");
  });

  it("RF01 · muestra la marca y los enlaces de navegación esenciales", () => {
    renderHeader();
    const cabecera = screen.getByRole("banner");
    expect(cabecera).toHaveTextContent("OppaStore");
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Catálogo" })).toHaveAttribute("href", "/catalogo");
    expect(screen.getByRole("link", { name: "Favoritos" })).toHaveAttribute("href", "/favoritos");
  });

  it("marca como página actual la ruta activa y solo esa", () => {
    pathnameMock.mockReturnValue("/catalogo");
    renderHeader();
    expect(screen.getByRole("link", { name: "Catálogo" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute("aria-current");
  });

  it("'/' solo está activo en la raíz exacta, no en subrutas", () => {
    pathnameMock.mockReturnValue("/producto/serum");
    renderHeader();
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute("aria-current");
  });

  it("marca 'Mi cuenta' como activo en cualquier subruta de /cuenta", () => {
    pathnameMock.mockReturnValue("/cuenta");
    renderHeader();
    const cuenta = screen
      .getByRole("banner")
      .querySelectorAll<HTMLAnchorElement>("a[aria-label='Mi cuenta']");
    expect(cuenta[0]).toHaveAttribute("aria-current", "page");
  });

  it("RF04 · sin ítems no muestra el contador del carrito", () => {
    renderHeader();
    expect(botonCarrito()).toHaveTextContent("Carrito");
    expect(botonCarrito().textContent).not.toMatch(/\d/);
  });

  it("RF04 · el contador del carrito suma unidades, no líneas", async () => {
    renderHeader();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "agregar" })); // 1 unidad
    expect(botonCarrito()).toHaveTextContent("1");

    await user.click(screen.getByRole("button", { name: "agregar 3" })); // +3 unidades
    expect(botonCarrito()).toHaveTextContent("4");

    await user.click(screen.getByRole("button", { name: "subir p1" })); // p1 pasa a 5
    expect(botonCarrito()).toHaveTextContent("8");
  });

  it("RF03 · el contador de favoritos refleja los productos marcados (RB08)", async () => {
    renderHeader();
    const user = userEvent.setup();
    const favoritos = () => screen.getByRole("link", { name: /Favoritos/ });

    expect(favoritos().textContent).not.toMatch(/\d/);
    await user.click(screen.getByRole("button", { name: "fav p1" }));
    expect(favoritos()).toHaveTextContent("1");
    await user.click(screen.getByRole("button", { name: "fav p2" }));
    expect(favoritos()).toHaveTextContent("2");
    await user.click(screen.getByRole("button", { name: "fav p1" })); // desmarcar
    expect(favoritos()).toHaveTextContent("1");
  });

  it("RF05 · el botón de carrito abre el drawer y refleja su estado con aria-pressed", async () => {
    renderHeader();
    expect(screen.getByTestId("drawer")).toHaveTextContent("cerrado");
    expect(botonCarrito()).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(botonCarrito());
    expect(screen.getByTestId("drawer")).toHaveTextContent("abierto");
    expect(botonCarrito()).toHaveAttribute("aria-pressed", "true");
  });

  it("la cabecera se compacta al desplazar la página más de 16 px", async () => {
    renderHeader();
    const barra = () => screen.getByRole("banner").querySelector("div > div")!;
    expect(barra().className).toContain("h-16"); // estado inicial, expandida

    Object.defineProperty(window, "scrollY", { configurable: true, value: 120 });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    // El manejador difiere el cálculo a un requestAnimationFrame.
    await waitFor(() => expect(barra().className).toContain("h-14"));
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  });

  it("limpia los listeners de scroll y resize al desmontar", () => {
    const quitar = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHeader();
    unmount();
    const eventos = quitar.mock.calls.map(([evento]) => evento);
    expect(eventos).toContain("scroll");
    expect(eventos).toContain("resize");
    quitar.mockRestore();
  });
});
