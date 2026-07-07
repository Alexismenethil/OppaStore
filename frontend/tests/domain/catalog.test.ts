import { describe, it, expect } from "vitest";
import { filtrarProductos, CATEGORIA_TODOS } from "@/domain/catalog";
import { producto } from "./fixtures";

const catalogo = [
  producto({ id: "1", nombre: "Serum Centella", categoria: "skincare", activo: true }),
  producto({ id: "2", nombre: "Peluche Panda", categoria: "peluches", activo: true }),
  producto({ id: "3", nombre: "Snack Honey Butter", categoria: "snacks", activo: true }),
  producto({ id: "4", nombre: "Mascarilla Vieja", categoria: "skincare", activo: false }),
];

describe("catálogo (RB10, RF12, RF13)", () => {
  it("CP01 · solo devuelve productos activos", () => {
    const r = filtrarProductos(catalogo);
    expect(r).toHaveLength(3);
    expect(r.find((p) => p.id === "4")).toBeUndefined();
  });

  it("CP02 · filtra por categoría", () => {
    const r = filtrarProductos(catalogo, { categoria: "skincare" });
    expect(r.map((p) => p.id)).toEqual(["1"]); // el inactivo (4) queda excluido
  });

  it("categoría 'todos' no filtra por categoría", () => {
    expect(filtrarProductos(catalogo, { categoria: CATEGORIA_TODOS })).toHaveLength(3);
  });

  it("CP03 · busca por nombre sin distinción de mayúsculas", () => {
    expect(filtrarProductos(catalogo, { q: "PANDA" }).map((p) => p.id)).toEqual(["2"]);
    expect(filtrarProductos(catalogo, { q: "  serum " }).map((p) => p.id)).toEqual(["1"]);
  });

  it("combina categoría y búsqueda", () => {
    const r = filtrarProductos(catalogo, { categoria: "snacks", q: "honey" });
    expect(r.map((p) => p.id)).toEqual(["3"]);
  });

  it("sin coincidencias devuelve lista vacía", () => {
    expect(filtrarProductos(catalogo, { q: "no-existe" })).toEqual([]);
  });
});
