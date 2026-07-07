import { describe, it, expect } from "vitest";
import {
  estadoProducto,
  etiquetaEstado,
  esComprable,
  maximoAgregable,
} from "@/domain/productStatus";
import { producto } from "./fixtures";

describe("estado del producto (RB02, RB09, RB19)", () => {
  it("CP05 · stock 0 => Agotado y no comprable", () => {
    const p = producto({ stock: 0 });
    expect(estadoProducto(p)).toBe("agotado");
    expect(etiquetaEstado(p)).toBe("Agotado");
    expect(esComprable(p)).toBe(false);
  });

  it("CP11 · stock entre 1 y 5 => Pocas unidades", () => {
    expect(estadoProducto(producto({ stock: 1 }))).toBe("pocas_unidades");
    expect(estadoProducto(producto({ stock: 5 }))).toBe("pocas_unidades");
    expect(etiquetaEstado(producto({ stock: 3 }))).toBe("Pocas unidades");
  });

  it("stock mayor a 5 => Disponible", () => {
    expect(estadoProducto(producto({ stock: 6 }))).toBe("disponible");
    expect(esComprable(producto({ stock: 6 }))).toBe(true);
  });

  it("CP10 · preventa prevalece en la etiqueta (RB03, RB19)", () => {
    const p = producto({ stock: 2, esPreventa: true });
    expect(estadoProducto(p)).toBe("preventa");
    expect(etiquetaEstado(p)).toBe("Preventa");
  });

  it("producto inactivo no es comprable (RB10 en catálogo, RB02 en compra)", () => {
    expect(esComprable(producto({ activo: false, stock: 5 }))).toBe(false);
  });

  it("máximo agregable = stock, nunca negativo (RB01)", () => {
    expect(maximoAgregable(producto({ stock: 7 }))).toBe(7);
    expect(maximoAgregable(producto({ stock: 0 }))).toBe(0);
  });
});
