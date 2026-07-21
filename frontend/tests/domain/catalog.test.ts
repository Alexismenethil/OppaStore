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

describe("catálogo · entradas vacías y valores límite (RF12, RF13)", () => {
  it("un catálogo vacío devuelve lista vacía con cualquier filtro", () => {
    expect(filtrarProductos([])).toEqual([]);
    expect(filtrarProductos([], { categoria: "skincare", q: "serum" })).toEqual([]);
  });

  it("una búsqueda vacía o de solo espacios no filtra por nombre", () => {
    expect(filtrarProductos(catalogo, { q: "" })).toHaveLength(3);
    expect(filtrarProductos(catalogo, { q: "   " })).toHaveLength(3);
  });

  it("una categoría vacía se trata como 'todos'", () => {
    expect(filtrarProductos(catalogo, { categoria: "" })).toHaveLength(3);
    expect(filtrarProductos(catalogo, { categoria: undefined })).toHaveLength(3);
  });

  it("una categoría inexistente no devuelve productos", () => {
    expect(filtrarProductos(catalogo, { categoria: "electronica" })).toEqual([]);
  });

  it("un solo carácter ya filtra por coincidencia parcial", () => {
    expect(filtrarProductos(catalogo, { q: "p" }).map((p) => p.id)).toEqual(["2"]);
    expect(filtrarProductos(catalogo, { q: "s" }).map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("busca por una subcadena en medio del nombre, no solo por prefijo", () => {
    expect(filtrarProductos(catalogo, { q: "centella" }).map((p) => p.id)).toEqual(["1"]);
    expect(filtrarProductos(catalogo, { q: "butter" }).map((p) => p.id)).toEqual(["3"]);
  });

  it("nunca devuelve inactivos, ni siquiera cuando coinciden con el filtro (RB10)", () => {
    expect(filtrarProductos(catalogo, { q: "mascarilla" })).toEqual([]);
    expect(filtrarProductos(catalogo, { categoria: "skincare", q: "vieja" })).toEqual([]);
  });

  it("combinación incompatible de categoría y búsqueda devuelve lista vacía", () => {
    // "panda" existe, pero no dentro de skincare.
    expect(filtrarProductos(catalogo, { categoria: "skincare", q: "panda" })).toEqual([]);
  });

  it("'todos' + búsqueda filtra solo por nombre", () => {
    const r = filtrarProductos(catalogo, { categoria: CATEGORIA_TODOS, q: "snack" });
    expect(r.map((p) => p.id)).toEqual(["3"]);
  });

  it("no muta ni reordena el catálogo de entrada", () => {
    const copia = [...catalogo];
    const r = filtrarProductos(catalogo);
    expect(catalogo).toEqual(copia);
    expect(r.map((p) => p.id)).toEqual(["1", "2", "3"]); // conserva el orden original
  });
});
