import { describe, it, expect } from "vitest";
import {
  agregarAlCarrito,
  actualizarCantidad,
  eliminarItem,
  totalCarrito,
  contarItems,
  validarCantidad,
  fusionarCarritos,
} from "@/domain/cart";
import type { ItemCarrito } from "@/domain/types";
import { producto } from "./fixtures";

describe("carrito (RB01, RB04, RB05, RB07)", () => {
  it("CP04 · agrega un producto disponible", () => {
    const items = agregarAlCarrito([], producto({ id: "a", stock: 10 }), 1);
    expect(items).toHaveLength(1);
    expect(items[0].cantidad).toBe(1);
    expect(contarItems(items)).toBe(1);
  });

  it("CP05 · no agrega un producto agotado", () => {
    const items = agregarAlCarrito([], producto({ id: "a", stock: 0 }), 1);
    expect(items).toHaveLength(0);
  });

  it("CP06 · no permite exceder el stock (RB01)", () => {
    const p = producto({ id: "a", stock: 3 });
    const items = agregarAlCarrito([], p, 4);
    expect(items[0].cantidad).toBe(3);

    const v = validarCantidad(p, 4);
    expect(v.ok).toBe(false);
    expect(v.motivo).toMatch(/3/);
  });

  it("validarCantidad rechaza inactivo, agotado y cantidades < 1 (RB02, RB07)", () => {
    expect(validarCantidad(producto({ activo: false }), 1).ok).toBe(false);
    expect(validarCantidad(producto({ stock: 0 }), 1).ok).toBe(false);
    expect(validarCantidad(producto({ stock: 5 }), 0).ok).toBe(false);
    expect(validarCantidad(producto({ stock: 5 }), 3).ok).toBe(true);
  });

  it("CP06 · no permite cantidades menores a 1 (RB07)", () => {
    const p = producto({ id: "a", stock: 5 });
    const items = actualizarCantidad(agregarAlCarrito([], p, 2), "a", 0);
    expect(items[0].cantidad).toBe(1);
  });

  it("no duplica el mismo producto: suma cantidades", () => {
    let items: ItemCarrito[] = [];
    const p = producto({ id: "a", stock: 10 });
    items = agregarAlCarrito(items, p, 2);
    items = agregarAlCarrito(items, p, 3);
    expect(items).toHaveLength(1);
    expect(items[0].cantidad).toBe(5);
  });

  it("CP07 · el total se calcula y actualiza (RB04, RB05)", () => {
    let items = agregarAlCarrito([], producto({ id: "a", precio: 65, stock: 10 }), 1);
    items = agregarAlCarrito(items, producto({ id: "b", precio: 45, stock: 10 }), 2);
    expect(totalCarrito(items)).toBe(155); // 65 + 45*2

    items = actualizarCantidad(items, "b", 1);
    expect(totalCarrito(items)).toBe(110); // 65 + 45
  });

  it("CP08 · elimina un producto del carrito", () => {
    let items = agregarAlCarrito([], producto({ id: "a", stock: 10 }), 1);
    items = agregarAlCarrito(items, producto({ id: "b", stock: 10 }), 1);
    items = eliminarItem(items, "a");
    expect(items).toHaveLength(1);
    expect(items[0].producto.id).toBe("b");
  });

  it("CP19 · fusiona carritos sin exceder stock (RB21)", () => {
    const p = producto({ id: "a", stock: 4 });
    const invitado = [{ producto: p, cantidad: 3 }];
    const guardado = [{ producto: p, cantidad: 3 }];
    const fusion = fusionarCarritos(invitado, guardado);
    expect(fusion).toHaveLength(1);
    expect(fusion[0].cantidad).toBe(4); // min(3+3, stock 4)
  });
});
