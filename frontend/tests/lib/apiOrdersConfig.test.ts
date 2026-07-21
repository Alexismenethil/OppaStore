import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { crearPedido } from "@/lib/api/orders";
import { fetchConfig, fetchCategorias } from "@/lib/api/config";
import { API_URL } from "@/lib/config";
import { producto } from "../domain/fixtures";
import type { DatosCliente, ItemCarrito } from "@/domain/types";

function respuesta(body: unknown, status = 200) {
  return {
    ok: status < 400,
    status,
    json: async () => body,
  } as Response;
}

/** Respuesta sin cuerpo JSON válido (p. ej. 502 de un proxy). */
function respuestaSinJson(status: number) {
  return {
    ok: false,
    status,
    json: async () => {
      throw new SyntaxError("Unexpected token");
    },
  } as unknown as Response;
}

const fetchMock = vi.fn();

const ITEMS: ItemCarrito[] = [
  { producto: producto({ id: "p1", precio: 65 }), cantidad: 2 },
  { producto: producto({ id: "p2", precio: 45 }), cantidad: 1 },
];

const DATOS: DatosCliente = {
  nombre: "Ana Quispe",
  provincia: "Ayacucho",
  distrito: "Jesús Nazareno",
  direccionEntrega: "Agencia Shalom",
  metodoEntrega: "delivery",
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("lib/api/orders (RF28, RB22)", () => {
  it("CP20 · envía los datos del cliente y solo id + cantidad de cada ítem", async () => {
    fetchMock.mockResolvedValue(
      respuesta({ pedido: { id: "ped-1", estado: "pendiente" }, mensaje: "Hola OppaStore" }, 201),
    );

    const r = await crearPedido(DATOS, ITEMS);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/orders`);
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({
      nombre: "Ana Quispe",
      provincia: "Ayacucho",
      distrito: "Jesús Nazareno",
      direccionEntrega: "Agencia Shalom",
      metodoEntrega: "delivery",
      usuarioId: undefined,
      items: [
        { productoId: "p1", cantidad: 2 },
        { productoId: "p2", cantidad: 1 },
      ],
    });
    expect(r.mensaje).toBe("Hola OppaStore");
  });

  it("adjunta el usuarioId cuando hay sesión (RF38)", async () => {
    fetchMock.mockResolvedValue(respuesta({ pedido: {}, mensaje: "" }, 201));
    await crearPedido(DATOS, ITEMS, "u-123");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).usuarioId).toBe("u-123");
  });

  it("propaga el mensaje de error del backend (p. ej. stock insuficiente, RB01)", async () => {
    fetchMock.mockResolvedValue(
      respuesta({ error: 'Stock insuficiente para "Tónico" (disponible: 2)' }, 400),
    );
    await expect(crearPedido(DATOS, ITEMS)).rejects.toThrow(/Stock insuficiente/);
  });

  it("si el error no trae cuerpo JSON usa un mensaje con el código HTTP", async () => {
    fetchMock.mockResolvedValue(respuestaSinJson(502));
    await expect(crearPedido(DATOS, ITEMS)).rejects.toThrow(/502/);
  });

  it("un carrito vacío igual se envía y el backend lo rechaza (validación en servidor)", async () => {
    fetchMock.mockResolvedValue(respuesta({ error: "Datos inválidos" }, 400));
    await expect(crearPedido(DATOS, [])).rejects.toThrow("Datos inválidos");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).items).toEqual([]);
  });
});

describe("lib/api/config (RF10)", () => {
  it("pide la configuración pública sin caché", async () => {
    fetchMock.mockResolvedValue(respuesta({ whatsapp: "51999888777", email: null }));
    await expect(fetchConfig()).resolves.toMatchObject({ whatsapp: "51999888777" });
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/config`, { cache: "no-store" });
  });

  it("lanza con el código HTTP si la configuración no está disponible", async () => {
    fetchMock.mockResolvedValue(respuesta(null, 500));
    await expect(fetchConfig()).rejects.toThrow(/500/);
  });

  it("pide las categorías con foto para el home y el catálogo", async () => {
    fetchMock.mockResolvedValue(
      respuesta([{ slug: "skincare", nombre: "Skincare Coreano", imagenUrl: null, overlay: null, orden: 1 }]),
    );
    const cats = await fetchCategorias();
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/categories`, { cache: "no-store" });
    expect(cats).toHaveLength(1);
  });

  it("lanza con el código HTTP si las categorías fallan", async () => {
    fetchMock.mockResolvedValue(respuesta(null, 404));
    await expect(fetchCategorias()).rejects.toThrow(/404/);
  });
});
