import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useProductos } from "@/features/catalog/useProductos";
import { useDestacados } from "@/features/catalog/useDestacados";
import { useProducto } from "@/features/catalog/useProducto";
import { producto } from "../domain/fixtures";

const fetchProductosMock = vi.fn();
const fetchDestacadosMock = vi.fn();
const fetchProductoMock = vi.fn();

vi.mock("@/lib/api/products", () => ({
  fetchProductos: (...a: unknown[]) => fetchProductosMock(...a),
  fetchDestacados: (...a: unknown[]) => fetchDestacadosMock(...a),
  fetchProducto: (...a: unknown[]) => fetchProductoMock(...a),
}));

beforeEach(() => {
  fetchProductosMock.mockReset();
  fetchDestacadosMock.mockReset();
  fetchProductoMock.mockReset();
});

describe("useProductos (RF11, RNF09)", () => {
  it("arranca cargando y sin productos", () => {
    fetchProductosMock.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useProductos());
    expect(result.current.cargando).toBe(true);
    expect(result.current.productos).toEqual([]);
    expect(result.current.usandoRespaldo).toBe(false);
  });

  it("expone los productos de la API sin marcar respaldo", async () => {
    fetchProductosMock.mockResolvedValue([producto({ id: "a" }), producto({ id: "b" })]);
    const { result } = renderHook(() => useProductos());

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.productos).toHaveLength(2);
    expect(result.current.usandoRespaldo).toBe(false);
  });

  it("RNF09 · si la API cae usa el catálogo semilla, solo con activos (RB10)", async () => {
    fetchProductosMock.mockRejectedValue(new Error("backend caído"));
    const { result } = renderHook(() => useProductos());

    await waitFor(() => expect(result.current.usandoRespaldo).toBe(true));
    expect(result.current.productos.length).toBeGreaterThan(0);
    expect(result.current.productos.every((p) => p.activo)).toBe(true);
    expect(result.current.cargando).toBe(false);
  });

  it("una API que devuelve lista vacía no activa el respaldo", async () => {
    fetchProductosMock.mockResolvedValue([]);
    const { result } = renderHook(() => useProductos());

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.productos).toEqual([]);
    expect(result.current.usandoRespaldo).toBe(false);
  });
});

describe("useDestacados (RF48)", () => {
  it("pide 4 destacados por defecto", async () => {
    fetchDestacadosMock.mockResolvedValue([producto({ id: "a" })]);
    const { result } = renderHook(() => useDestacados());

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(fetchDestacadosMock).toHaveBeenCalledWith(4);
    expect(result.current.destacados).toHaveLength(1);
  });

  it("propaga el límite recibido y recarga al cambiarlo", async () => {
    fetchDestacadosMock.mockResolvedValue([]);
    const { rerender } = renderHook(({ n }) => useDestacados(n), { initialProps: { n: 6 } });

    await waitFor(() => expect(fetchDestacadosMock).toHaveBeenCalledWith(6));
    rerender({ n: 8 });
    await waitFor(() => expect(fetchDestacadosMock).toHaveBeenCalledWith(8));
  });

  it("RNF09 · si la API falla devuelve lista vacía y deja de cargar", async () => {
    fetchDestacadosMock.mockRejectedValue(new Error("backend caído"));
    const { result } = renderHook(() => useDestacados());

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.destacados).toEqual([]);
  });
});

describe("useProducto (RF18, RB10, RNF09)", () => {
  it("arranca en estado de carga", () => {
    fetchProductoMock.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useProducto("serum-centella-asiatica"));
    expect(result.current).toEqual({ cargando: true, producto: null, noEncontrado: false });
  });

  it("devuelve el producto activo de la API", async () => {
    fetchProductoMock.mockResolvedValue(producto({ slug: "tonico-yuja-niacin", nombre: "Tónico" }));
    const { result } = renderHook(() => useProducto("tonico-yuja-niacin"));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.producto?.nombre).toBe("Tónico");
    expect(result.current.noEncontrado).toBe(false);
  });

  it("completa las imágenes faltantes con las del catálogo semilla", async () => {
    fetchProductoMock.mockResolvedValue(
      producto({ slug: "serum-centella-asiatica", imagenUrl: undefined, imagenes: [] }),
    );
    const { result } = renderHook(() => useProducto("serum-centella-asiatica"));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.producto?.imagenUrl).toBeTruthy();
  });

  it("RB10 · un producto inactivo se reporta como no encontrado", async () => {
    fetchProductoMock.mockResolvedValue(producto({ slug: "x", activo: false }));
    const { result } = renderHook(() => useProducto("x"));

    await waitFor(() => expect(result.current.noEncontrado).toBe(true));
    expect(result.current.producto).toBeNull();
  });

  it("un slug inexistente (404 → null) se reporta como no encontrado", async () => {
    fetchProductoMock.mockResolvedValue(null);
    const { result } = renderHook(() => useProducto("no-existe"));

    await waitFor(() => expect(result.current.noEncontrado).toBe(true));
  });

  it("RNF09 · si la API falla recurre al catálogo semilla por slug", async () => {
    fetchProductoMock.mockRejectedValue(new Error("backend caído"));
    const { result } = renderHook(() => useProducto("peluche-panda-premium"));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.producto?.nombre).toBe("Peluche Panda Premium");
  });

  it("si falla la API y el slug tampoco está en la semilla, es no encontrado", async () => {
    fetchProductoMock.mockRejectedValue(new Error("backend caído"));
    const { result } = renderHook(() => useProducto("slug-inventado"));

    await waitFor(() => expect(result.current.noEncontrado).toBe(true));
  });

  it("vuelve a consultar al cambiar de slug", async () => {
    fetchProductoMock.mockResolvedValue(producto({ slug: "a" }));
    const { rerender } = renderHook(({ slug }) => useProducto(slug), {
      initialProps: { slug: "a" },
    });
    await waitFor(() => expect(fetchProductoMock).toHaveBeenCalledWith("a"));

    rerender({ slug: "b" });
    await waitFor(() => expect(fetchProductoMock).toHaveBeenCalledWith("b"));
  });
});
