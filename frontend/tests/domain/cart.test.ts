import { describe, it, expect } from "vitest";
import {
  agregarAlCarrito,
  actualizarCantidad,
  eliminarItem,
  totalCarrito,
  contarItems,
  validarCantidad,
  fusionarCarritos,
  cantidadEnCarrito,
  subtotalItem,
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

describe("carrito · carrito vacío y consultas (RB04)", () => {
  it("un carrito vacío tiene 0 unidades y total 0", () => {
    expect(contarItems([])).toBe(0);
    expect(totalCarrito([])).toBe(0);
  });

  it("cantidadEnCarrito devuelve 0 para un producto ausente", () => {
    const items = agregarAlCarrito([], producto({ id: "a", stock: 5 }), 2);
    expect(cantidadEnCarrito(items, "a")).toBe(2);
    expect(cantidadEnCarrito(items, "no-existe")).toBe(0);
    expect(cantidadEnCarrito([], "a")).toBe(0);
  });

  it("subtotalItem redondea a céntimos (RB18)", () => {
    expect(subtotalItem({ producto: producto({ precio: 12.5 }), cantidad: 3 })).toBe(37.5);
    // 0.1 * 3 = 0.30000000000000004 sin redondeo.
    expect(subtotalItem({ producto: producto({ precio: 0.1 }), cantidad: 3 })).toBe(0.3);
  });

  it("el total acumula decimales sin arrastrar error de coma flotante (RB04, RB18)", () => {
    const items: ItemCarrito[] = [
      { producto: producto({ id: "a", precio: 0.1 }), cantidad: 3 },
      { producto: producto({ id: "b", precio: 0.2 }), cantidad: 1 },
    ];
    expect(totalCarrito(items)).toBe(0.5);
  });
});

describe("carrito · límites al agregar (RB01, RB02, RB07)", () => {
  it("una cantidad de 0 o negativa nunca deja el ítem por debajo de 1 (RB07)", () => {
    const p = producto({ id: "a", stock: 5 });
    expect(agregarAlCarrito([], p, 0)[0].cantidad).toBe(1);
    expect(agregarAlCarrito([], p, -4)[0].cantidad).toBe(1);
  });

  it("agregar exactamente el stock disponible es válido (límite superior)", () => {
    const p = producto({ id: "a", stock: 3 });
    expect(agregarAlCarrito([], p, 3)[0].cantidad).toBe(3);
    expect(validarCantidad(p, 3).ok).toBe(true);
    expect(validarCantidad(p, 4).ok).toBe(false);
  });

  it("sumar sobre un carrito que ya está en el tope deja la cantidad en el stock (RB01)", () => {
    const p = producto({ id: "a", stock: 2 });
    const enTope = agregarAlCarrito([], p, 2);
    const otraVez = agregarAlCarrito(enTope, p, 5);
    expect(otraVez).toHaveLength(1);
    expect(otraVez[0].cantidad).toBe(2);
  });

  it("un producto inactivo no entra al carrito aunque tenga stock (RB02)", () => {
    expect(agregarAlCarrito([], producto({ id: "a", activo: false, stock: 9 }), 1)).toEqual([]);
  });

  it("no muta el carrito original: devuelve una lista nueva (inmutabilidad)", () => {
    const original: ItemCarrito[] = [];
    const nuevo = agregarAlCarrito(original, producto({ id: "a", stock: 5 }), 1);
    expect(original).toHaveLength(0);
    expect(nuevo).not.toBe(original);
  });

  it("no toca los demás ítems al agregar uno existente", () => {
    let items = agregarAlCarrito([], producto({ id: "a", stock: 5 }), 1);
    items = agregarAlCarrito(items, producto({ id: "b", stock: 5 }), 1);
    const antes = items[0];
    items = agregarAlCarrito(items, producto({ id: "b", stock: 5 }), 2);
    expect(items[0]).toBe(antes); // el ítem "a" se conserva por referencia
    expect(items[1].cantidad).toBe(3);
  });
});

describe("carrito · actualizar y eliminar (RB01, RB07)", () => {
  it("actualizarCantidad recorta al stock por arriba y a 1 por abajo", () => {
    const items = agregarAlCarrito([], producto({ id: "a", stock: 4 }), 2);
    expect(actualizarCantidad(items, "a", 99)[0].cantidad).toBe(4);
    expect(actualizarCantidad(items, "a", -10)[0].cantidad).toBe(1);
    expect(actualizarCantidad(items, "a", 3)[0].cantidad).toBe(3);
  });

  it("actualizarCantidad de un producto ausente deja el carrito intacto", () => {
    const items = agregarAlCarrito([], producto({ id: "a", stock: 4 }), 2);
    expect(actualizarCantidad(items, "no-existe", 3)).toEqual(items);
  });

  it("eliminar un producto ausente deja el carrito intacto", () => {
    const items = agregarAlCarrito([], producto({ id: "a", stock: 4 }), 2);
    expect(eliminarItem(items, "no-existe")).toHaveLength(1);
    expect(eliminarItem([], "a")).toEqual([]);
  });

  it("eliminar el último ítem deja el carrito vacío con total 0", () => {
    const items = eliminarItem(agregarAlCarrito([], producto({ id: "a", stock: 4 }), 2), "a");
    expect(items).toEqual([]);
    expect(totalCarrito(items)).toBe(0);
    expect(contarItems(items)).toBe(0);
  });

  it("validarCantidad prioriza 'no disponible' sobre 'agotado' en un inactivo sin stock", () => {
    expect(validarCantidad(producto({ activo: false, stock: 0 }), 1).motivo).toBe(
      "Producto no disponible",
    );
    expect(validarCantidad(producto({ stock: 0 }), 1).motivo).toBe("Producto agotado");
    expect(validarCantidad(producto({ stock: 5 }), 0).motivo).toMatch(/mínima es 1/i);
  });
});

describe("carrito · fusión invitado + guardado (RB21)", () => {
  it("fusionar dos carritos vacíos devuelve un carrito vacío", () => {
    expect(fusionarCarritos([], [])).toEqual([]);
  });

  it("conserva los productos que solo están en uno de los dos carritos", () => {
    const a = producto({ id: "a", stock: 5 });
    const b = producto({ id: "b", stock: 5 });
    const fusion = fusionarCarritos([{ producto: a, cantidad: 1 }], [{ producto: b, cantidad: 2 }]);
    expect(fusion).toHaveLength(2);
    expect(fusion.map((i) => [i.producto.id, i.cantidad])).toEqual([
      ["b", 2], // el guardado se recorre primero
      ["a", 1],
    ]);
  });

  it("suma cantidades cuando el total cabe en el stock", () => {
    const p = producto({ id: "a", stock: 10 });
    const fusion = fusionarCarritos([{ producto: p, cantidad: 2 }], [{ producto: p, cantidad: 3 }]);
    expect(fusion[0].cantidad).toBe(5);
  });

  it("usa la versión más reciente del producto (la del invitado) al fusionar", () => {
    const guardado = producto({ id: "a", stock: 10, precio: 50 });
    const invitado = producto({ id: "a", stock: 10, precio: 65 }); // precio actualizado
    const fusion = fusionarCarritos(
      [{ producto: invitado, cantidad: 1 }],
      [{ producto: guardado, cantidad: 1 }],
    );
    expect(fusion[0].producto.precio).toBe(65);
  });
});
