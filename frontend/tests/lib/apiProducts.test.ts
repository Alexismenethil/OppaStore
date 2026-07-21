import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mapProducto,
  fetchProductos,
  fetchProducto,
  fetchDestacados,
} from "@/lib/api/products";
import { API_URL } from "@/lib/config";

/** Producto tal como lo serializa Prisma (precio Decimal → string). */
function apiProducto(overrides: Record<string, unknown> = {}) {
  return {
    id: "p1",
    slug: "serum-centella",
    nombre: "Serum Centella",
    descripcion: "desc",
    precio: "92.00",
    stock: 20,
    tipo: "skincare",
    activo: true,
    esPreventa: false,
    fechaEstimadaLlegada: null,
    fechaVencimiento: null,
    infoAdicional: null,
    imagenUrl: null,
    imagenes: null,
    destacado: false,
    categoria: { slug: "skincare", nombre: "Skincare Coreano" },
    ...overrides,
  };
}

function respuesta(body: unknown, init: { status?: number; ok?: boolean } = {}) {
  const status = init.status ?? 200;
  return {
    ok: init.ok ?? status < 400,
    status,
    json: async () => body,
  } as Response;
}

const fetchMock = vi.fn();

describe("lib/api/products (RF11, RF18, RF48)", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("mapProducto", () => {
    it("convierte el precio Decimal serializado a número (RB18)", () => {
      expect(mapProducto(apiProducto({ precio: "92.50" })).precio).toBe(92.5);
    });

    it("usa el slug de la categoría relacionada y cae a '' si no viene", () => {
      expect(mapProducto(apiProducto()).categoria).toBe("skincare");
      expect(mapProducto(apiProducto({ categoria: undefined })).categoria).toBe("");
    });

    it("normaliza los nulos de la API a undefined del dominio", () => {
      const p = mapProducto(apiProducto());
      expect(p.fechaVencimiento).toBeUndefined();
      expect(p.fechaEstimadaLlegada).toBeUndefined();
      expect(p.infoAdicional).toBeUndefined();
      expect(p.imagenUrl).toBeUndefined();
      expect(p.imagenes).toBeUndefined();
    });

    it("descarta las imágenes vacías de la galería", () => {
      const p = mapProducto(apiProducto({ imagenes: ["https://a.jpg", "", "https://b.jpg"] }));
      expect(p.imagenes).toEqual(["https://a.jpg", "https://b.jpg"]);
    });

    it("conserva la info específica del producto (RF19)", () => {
      const p = mapProducto(apiProducto({ infoAdicional: { alergenos: "Contiene gluten" } }));
      expect(p.infoAdicional).toEqual({ alergenos: "Contiene gluten" });
    });
  });

  describe("fetchProductos", () => {
    it("sin filtros pide la lista sin query string", async () => {
      fetchMock.mockResolvedValue(respuesta([apiProducto()]));
      const productos = await fetchProductos();
      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/products`, { cache: "no-store" });
      expect(productos).toHaveLength(1);
      expect(productos[0].precio).toBe(92);
    });

    it("RF12/RF13 · envía categoría y búsqueda como query string", async () => {
      fetchMock.mockResolvedValue(respuesta([]));
      await fetchProductos({ categoria: "snacks", q: "honey butter" });
      expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/products?categoria=snacks&q=honey+butter`);
    });

    it("omite los filtros vacíos del query string", async () => {
      fetchMock.mockResolvedValue(respuesta([]));
      await fetchProductos({ categoria: "", q: "" });
      expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/products`);
    });

    it("una respuesta vacía devuelve una lista vacía", async () => {
      fetchMock.mockResolvedValue(respuesta([]));
      await expect(fetchProductos()).resolves.toEqual([]);
    });

    it("lanza un error con el código HTTP si la API falla", async () => {
      fetchMock.mockResolvedValue(respuesta(null, { status: 500 }));
      await expect(fetchProductos()).rejects.toThrow(/500/);
    });
  });

  describe("fetchProducto", () => {
    it("RF18 · devuelve el producto mapeado del slug pedido", async () => {
      fetchMock.mockResolvedValue(respuesta(apiProducto({ slug: "tonico-yuja" })));
      const p = await fetchProducto("tonico-yuja");
      expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/products/tonico-yuja`);
      expect(p?.slug).toBe("tonico-yuja");
    });

    it("devuelve null (no lanza) cuando el producto no existe: 404", async () => {
      fetchMock.mockResolvedValue(respuesta({ error: "Producto no encontrado" }, { status: 404 }));
      await expect(fetchProducto("no-existe")).resolves.toBeNull();
    });

    it("lanza si el error no es 404", async () => {
      fetchMock.mockResolvedValue(respuesta(null, { status: 500 }));
      await expect(fetchProducto("x")).rejects.toThrow(/500/);
    });
  });

  describe("fetchDestacados", () => {
    it("RF48 · usa límite 4 por defecto", async () => {
      fetchMock.mockResolvedValue(respuesta([]));
      await fetchDestacados();
      expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/products/destacados?limit=4`);
    });

    it("propaga el límite solicitado", async () => {
      fetchMock.mockResolvedValue(respuesta([apiProducto(), apiProducto({ id: "p2" })]));
      const destacados = await fetchDestacados(8);
      expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/products/destacados?limit=8`);
      expect(destacados).toHaveLength(2);
    });

    it("lanza un error con el código HTTP si la API falla", async () => {
      fetchMock.mockResolvedValue(respuesta(null, { status: 503 }));
      await expect(fetchDestacados()).rejects.toThrow(/503/);
    });
  });
});
