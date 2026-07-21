import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "@/features/cart/CartContext";
import { fusionarCarritos } from "@/domain/cart";
import { producto } from "../domain/fixtures";
import type { ItemCarrito } from "@/domain/types";

const CLAVE = "oppastore.carrito.v1";

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

function renderCarrito() {
  return renderHook(() => useCart(), { wrapper });
}

function guardado(): ItemCarrito[] {
  return JSON.parse(window.localStorage.getItem(CLAVE) ?? "[]");
}

describe("CartContext (RB01, RB04, RB17)", () => {
  it("arranca vacío cuando no hay nada persistido", () => {
    const { result } = renderCarrito();
    expect(result.current.items).toEqual([]);
    expect(result.current.totalUnidades).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.abierto).toBe(false);
  });

  it("useCart fuera del provider lanza un error explícito", () => {
    const silenciar = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useCart())).toThrow(/CartProvider/);
    silenciar.mockRestore();
  });

  it("CP04 · agregar devuelve ok y actualiza unidades y total (RB04)", () => {
    const { result } = renderCarrito();
    act(() => {
      expect(result.current.agregar(producto({ id: "a", precio: 65, stock: 10 }), 1).ok).toBe(true);
    });
    expect(result.current.totalUnidades).toBe(1);
    expect(result.current.total).toBe(65);
  });

  it("CP05 · agregar un producto agotado devuelve el motivo y no cambia el carrito (RB02)", () => {
    const { result } = renderCarrito();
    let resultado: { ok: boolean; motivo?: string } = { ok: true };
    act(() => {
      resultado = result.current.agregar(producto({ id: "a", stock: 0 }), 1);
    });
    expect(resultado.ok).toBe(false);
    expect(resultado.motivo).toBe("Producto agotado");
    expect(result.current.items).toEqual([]);
  });

  it("CP06 · agregar valida contra la cantidad YA presente en el carrito (RB01)", () => {
    const { result } = relleno(3, 2);
    let segundo: { ok: boolean; motivo?: string } = { ok: true };
    act(() => {
      segundo = result.current.agregar(producto({ id: "a", stock: 3 }), 2); // 2 + 2 > 3
    });
    expect(segundo.ok).toBe(false);
    expect(segundo.motivo).toMatch(/3/);
    expect(result.current.totalUnidades).toBe(2); // no se modificó
  });

  it("cambiarCantidad respeta los límites [1, stock] (RB07)", () => {
    const { result } = relleno(5, 2);
    act(() => result.current.cambiarCantidad("a", 99));
    expect(result.current.totalUnidades).toBe(5);
    act(() => result.current.cambiarCantidad("a", 0));
    expect(result.current.totalUnidades).toBe(1);
  });

  it("CP08 · eliminar quita la línea y vaciar deja el carrito en cero", () => {
    const { result } = relleno(5, 2);
    act(() => {
      result.current.agregar(producto({ id: "b", stock: 5 }), 1);
    });
    act(() => result.current.eliminar("a"));
    expect(result.current.items).toHaveLength(1);

    act(() => result.current.vaciar());
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it("abrir y cerrar controlan el drawer lateral", () => {
    const { result } = renderCarrito();
    act(() => result.current.abrir());
    expect(result.current.abierto).toBe(true);
    act(() => result.current.cerrar());
    expect(result.current.abierto).toBe(false);
  });

  it("RB17 · persiste el carrito en localStorage tras cada cambio", async () => {
    const { result } = relleno(5, 2);
    await waitFor(() => expect(guardado()).toHaveLength(1));
    expect(guardado()[0].cantidad).toBe(2);

    act(() => result.current.vaciar());
    await waitFor(() => expect(guardado()).toEqual([]));
  });

  it("RB17 · rehidrata el carrito guardado al montar", async () => {
    const previo: ItemCarrito[] = [{ producto: producto({ id: "a", precio: 30, stock: 5 }), cantidad: 3 }];
    window.localStorage.setItem(CLAVE, JSON.stringify(previo));

    const { result } = renderCarrito();
    await waitFor(() => expect(result.current.totalUnidades).toBe(3));
    expect(result.current.total).toBe(90);
  });

  it("un localStorage corrupto no rompe la app: arranca vacío (RNF09)", () => {
    const silenciar = vi.spyOn(console, "warn").mockImplementation(() => {});
    window.localStorage.setItem(CLAVE, "{no es json");
    const { result } = renderCarrito();
    expect(result.current.items).toEqual([]);
    expect(silenciar).toHaveBeenCalled(); // se avisa en consola, sin romper la UI
    silenciar.mockRestore();
  });

  it("CP19 · reemplazar aplica la fusión con el carrito guardado (RB21)", () => {
    const p = producto({ id: "a", stock: 4 });
    const { result } = renderCarrito();
    act(() => {
      result.current.agregar(p, 3);
    });
    act(() => {
      result.current.reemplazar(fusionarCarritos(result.current.items, [{ producto: p, cantidad: 3 }]));
    });
    expect(result.current.totalUnidades).toBe(4); // recortado al stock
  });
});

/** Carrito con un producto "a" de `stock` unidades y `cantidad` en el carrito. */
function relleno(stock: number, cantidad: number) {
  const vista = renderCarrito();
  act(() => {
    vista.result.current.agregar(producto({ id: "a", precio: 10, stock }), cantidad);
  });
  return vista;
}
