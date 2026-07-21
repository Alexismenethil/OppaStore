import { describe, it, expect } from "vitest";
import {
  estadoProducto,
  etiquetaEstado,
  esComprable,
  maximoAgregable,
  UMBRAL_POCAS_UNIDADES,
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

describe("estado del producto · casos de borde (RB02, RB09, RB19)", () => {
  it("respeta el umbral exacto de 'pocas unidades' (5 vs 6)", () => {
    expect(UMBRAL_POCAS_UNIDADES).toBe(5);
    expect(estadoProducto(producto({ stock: UMBRAL_POCAS_UNIDADES }))).toBe("pocas_unidades");
    expect(estadoProducto(producto({ stock: UMBRAL_POCAS_UNIDADES + 1 }))).toBe("disponible");
  });

  it("un stock negativo (dato corrupto) se trata como agotado", () => {
    const p = producto({ stock: -3 });
    expect(estadoProducto(p)).toBe("agotado");
    expect(esComprable(p)).toBe(false);
    expect(maximoAgregable(p)).toBe(0); // nunca negativo (RB01)
  });

  it("la preventa manda sobre agotado en la etiqueta, pero sin stock no es comprable (RB03)", () => {
    const preventaSinStock = producto({ esPreventa: true, stock: 0 });
    expect(estadoProducto(preventaSinStock)).toBe("preventa");
    expect(etiquetaEstado(preventaSinStock)).toBe("Preventa");
    expect(esComprable(preventaSinStock)).toBe(false); // RB02 sigue aplicando
  });

  it("una preventa con stock sí es comprable (RF33)", () => {
    const preventaConStock = producto({ esPreventa: true, stock: 15 });
    expect(estadoProducto(preventaConStock)).toBe("preventa");
    expect(esComprable(preventaConStock)).toBe(true);
    expect(maximoAgregable(preventaConStock)).toBe(15);
  });

  it("un producto inactivo conserva su etiqueta derivada del stock (RB19)", () => {
    // La etiqueta depende solo del stock/preventa; el catálogo público es quien
    // oculta los inactivos (RB10).
    const inactivo = producto({ activo: false, stock: 3 });
    expect(etiquetaEstado(inactivo)).toBe("Pocas unidades");
    expect(esComprable(inactivo)).toBe(false);
  });

  it("cubre las cuatro etiquetas del design system (RF14)", () => {
    expect(etiquetaEstado(producto({ stock: 20 }))).toBe("Disponible");
    expect(etiquetaEstado(producto({ stock: 1 }))).toBe("Pocas unidades");
    expect(etiquetaEstado(producto({ stock: 0 }))).toBe("Agotado");
    expect(etiquetaEstado(producto({ stock: 4, esPreventa: true }))).toBe("Preventa");
  });
});
