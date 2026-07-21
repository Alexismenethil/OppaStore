import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { FavoritesProvider, useFavorites } from "@/features/favorites/FavoritesContext";

const CLAVE = "oppastore.favoritos.v1";

function wrapper({ children }: { children: ReactNode }) {
  return <FavoritesProvider>{children}</FavoritesProvider>;
}

function renderFavoritos() {
  return renderHook(() => useFavorites(), { wrapper });
}

function guardado(): string[] {
  return JSON.parse(window.localStorage.getItem(CLAVE) ?? "[]");
}

describe("FavoritesContext (RB08, RB17)", () => {
  it("arranca sin favoritos", () => {
    const { result } = renderFavoritos();
    expect(result.current.ids).toEqual([]);
    expect(result.current.totalFavoritos).toBe(0);
  });

  it("useFavorites fuera del provider lanza un error explícito", () => {
    const silenciar = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useFavorites())).toThrow(/FavoritesProvider/);
    silenciar.mockRestore();
  });

  it("alternar devuelve si el producto QUEDÓ marcado", () => {
    const { result } = renderFavoritos();
    let quedo = false;
    act(() => {
      quedo = result.current.alternar("p1");
    });
    expect(quedo).toBe(true);
    expect(result.current.esFavorito("p1")).toBe(true);

    act(() => {
      quedo = result.current.alternar("p1");
    });
    expect(quedo).toBe(false);
    expect(result.current.esFavorito("p1")).toBe(false);
  });

  it("CP12 · marcar dos veces el mismo producto no lo duplica (RB08)", () => {
    const { result } = renderFavoritos();
    act(() => {
      result.current.alternar("p1");
    });
    act(() => {
      result.current.alternar("p2");
    });
    expect(result.current.ids).toEqual(["p1", "p2"]);
    expect(result.current.totalFavoritos).toBe(2);
  });

  it("esFavorito distingue ids que comparten prefijo", () => {
    const { result } = renderFavoritos();
    act(() => {
      result.current.alternar("p10");
    });
    expect(result.current.esFavorito("p1")).toBe(false);
    expect(result.current.esFavorito("p10")).toBe(true);
  });

  it("reemplazar deduplica la lista recibida del servidor (RF37)", () => {
    const { result } = renderFavoritos();
    act(() => result.current.reemplazar(["p1", "p2", "p1", "p3", "p2"]));
    expect(result.current.ids).toEqual(["p1", "p2", "p3"]);
    expect(result.current.totalFavoritos).toBe(3);
  });

  it("reemplazar con lista vacía limpia los favoritos", () => {
    const { result } = renderFavoritos();
    act(() => result.current.reemplazar(["p1"]));
    act(() => result.current.reemplazar([]));
    expect(result.current.ids).toEqual([]);
  });

  it("RB17 · persiste los favoritos en localStorage", async () => {
    const { result } = renderFavoritos();
    act(() => {
      result.current.alternar("p1");
    });
    await waitFor(() => expect(guardado()).toEqual(["p1"]));

    act(() => {
      result.current.alternar("p1");
    });
    await waitFor(() => expect(guardado()).toEqual([]));
  });

  it("RB17 · rehidrata los favoritos guardados al montar", async () => {
    window.localStorage.setItem(CLAVE, JSON.stringify(["p1", "p2"]));
    const { result } = renderFavoritos();
    await waitFor(() => expect(result.current.totalFavoritos).toBe(2));
    expect(result.current.esFavorito("p2")).toBe(true);
  });

  it("un localStorage corrupto no rompe la app: arranca vacío (RNF09)", () => {
    const silenciar = vi.spyOn(console, "warn").mockImplementation(() => {});
    window.localStorage.setItem(CLAVE, "[[[");
    const { result } = renderFavoritos();
    expect(result.current.ids).toEqual([]);
    expect(silenciar).toHaveBeenCalled(); // se avisa en consola, sin romper la UI
    silenciar.mockRestore();
  });
});
