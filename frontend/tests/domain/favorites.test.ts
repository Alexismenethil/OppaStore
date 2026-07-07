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
