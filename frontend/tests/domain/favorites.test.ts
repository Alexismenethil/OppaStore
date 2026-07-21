import { describe, it, expect } from "vitest";
import {
  agregarFavorito,
  alternarFavorito,
  esFavorito,
  quitarFavorito,
} from "@/domain/favorites";

describe("favoritos (RB08)", () => {
  it("CP12 · no duplica un producto ya favorito", () => {
    let favs = agregarFavorito([], "p1");
    favs = agregarFavorito(favs, "p1");
    expect(favs).toEqual(["p1"]);
  });

  it("alterna: agrega si no está, quita si está", () => {
    let favs = alternarFavorito([], "p1");
    expect(esFavorito(favs, "p1")).toBe(true);
    favs = alternarFavorito(favs, "p1");
    expect(esFavorito(favs, "p1")).toBe(false);
  });

  it("quita un favorito existente", () => {
    expect(quitarFavorito(["p1", "p2"], "p1")).toEqual(["p2"]);
  });
});

describe("favoritos · casos de borde (RB08)", () => {
  it("una lista vacía no contiene favoritos", () => {
    expect(esFavorito([], "p1")).toBe(false);
    expect(quitarFavorito([], "p1")).toEqual([]);
  });

  it("quitar un id ausente deja la lista igual", () => {
    expect(quitarFavorito(["p1", "p2"], "p9")).toEqual(["p1", "p2"]);
  });

  it("agrega al final conservando el orden de marcado", () => {
    let favs = agregarFavorito([], "p1");
    favs = agregarFavorito(favs, "p2");
    favs = agregarFavorito(favs, "p3");
    expect(favs).toEqual(["p1", "p2", "p3"]);
  });

  it("agregar un duplicado devuelve la MISMA referencia (sin re-render innecesario)", () => {
    const favs = ["p1"];
    expect(agregarFavorito(favs, "p1")).toBe(favs);
  });

  it("no muta la lista original al agregar o quitar", () => {
    const favs = ["p1"];
    expect(agregarFavorito(favs, "p2")).not.toBe(favs);
    expect(favs).toEqual(["p1"]);
    quitarFavorito(favs, "p1");
    expect(favs).toEqual(["p1"]);
  });

  it("alternar dos veces devuelve al estado inicial (idempotencia del par)", () => {
    const inicial = ["p1", "p2"];
    const ida = alternarFavorito(inicial, "p3");
    expect(ida).toEqual(["p1", "p2", "p3"]);
    expect(alternarFavorito(ida, "p3")).toEqual(["p1", "p2"]);
  });

  it("distingue ids parecidos (no usa coincidencia parcial)", () => {
    expect(esFavorito(["p10"], "p1")).toBe(false);
    expect(quitarFavorito(["p1", "p10"], "p1")).toEqual(["p10"]);
  });

  it("elimina todas las apariciones si la lista llegara duplicada desde storage", () => {
    // Defensa ante datos corruptos en localStorage (RB17).
    expect(quitarFavorito(["p1", "p1", "p2"], "p1")).toEqual(["p2"]);
  });
});
