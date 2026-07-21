import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { adminApi, ApiError } from "@/lib/api/admin";
import { API_URL } from "@/lib/config";

function respuesta(body: unknown, status = 200) {
  return { ok: status < 400, status, json: async () => body } as Response;
}

function respuestaSinJson(status: number) {
  return {
    ok: false,
    status,
    json: async () => {
      throw new SyntaxError("sin cuerpo");
    },
  } as unknown as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  window.localStorage.setItem("oppastore.token.v1", "token-admin");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Devuelve [url, init] de la última llamada a fetch. */
function ultimaLlamada(): [string, RequestInit] {
  return fetchMock.mock.calls.at(-1) as [string, RequestInit];
}

describe("lib/api/admin (RF42–RF48)", () => {
  it("adjunta el token guardado como Bearer y pide sin caché", async () => {
    fetchMock.mockResolvedValue(respuesta([]));
    await adminApi.productos();

    const [url, init] = ultimaLlamada();
    expect(url).toBe(`${API_URL}/admin/products`);
    expect(init.headers).toMatchObject({
      Authorization: "Bearer token-admin",
      "Content-Type": "application/json",
    });
    expect(init.cache).toBe("no-store");
  });

  it("sin token guardado envía un Bearer vacío (el backend responde 401)", async () => {
    window.localStorage.removeItem("oppastore.token.v1");
    fetchMock.mockResolvedValue(respuesta({ error: "Sesión requerida" }, 401));

    await expect(adminApi.productos()).rejects.toBeInstanceOf(ApiError);
    expect(ultimaLlamada()[1].headers).toMatchObject({ Authorization: "Bearer " });
  });

  it("CP21 · un 403 se expone como ApiError con status 403 y su mensaje", async () => {
    fetchMock.mockResolvedValue(
      respuesta({ error: "Acceso restringido a administradores" }, 403),
    );
    await expect(adminApi.summary()).rejects.toMatchObject({
      status: 403,
      message: "Acceso restringido a administradores",
    });
  });

  it("un 501 sin cuerpo cae a un mensaje con el código HTTP", async () => {
    fetchMock.mockResolvedValue(respuestaSinJson(501));
    await expect(adminApi.firmarSubida()).rejects.toMatchObject({
      status: 501,
      message: "Error 501",
    });
  });

  it("RF43 · crear producto hace POST con el cuerpo serializado", async () => {
    fetchMock.mockResolvedValue(respuesta({ id: "p1", slug: "producto-qa" }, 201));
    await adminApi.crearProducto({
      nombre: "Producto QA",
      descripcion: "desc",
      precio: 30.5,
      stock: 10,
      categoriaSlug: "skincare",
      tipo: "skincare",
    });

    const [url, init] = ultimaLlamada();
    expect(url).toBe(`${API_URL}/admin/products`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toMatchObject({ nombre: "Producto QA", precio: 30.5 });
  });

  it("RF44 · editar producto hace PUT sobre el id", async () => {
    fetchMock.mockResolvedValue(respuesta({ id: "p1" }));
    await adminApi.editarProducto("p1", { precio: 45 });

    const [url, init] = ultimaLlamada();
    expect(url).toBe(`${API_URL}/admin/products/p1`);
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body as string)).toEqual({ precio: 45 });
  });

  it("CP17 · cambiar estado hace PATCH con el flag activo", async () => {
    fetchMock.mockResolvedValue(respuesta({ id: "p1", activo: false }));
    await adminApi.cambiarEstadoProducto("p1", false);

    const [url, init] = ultimaLlamada();
    expect(url).toBe(`${API_URL}/admin/products/p1/estado`);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ activo: false });
  });

  it("borrar producto usa DELETE y devuelve el tipo de eliminación", async () => {
    fetchMock.mockResolvedValue(respuesta({ eliminado: "logico" }));
    await expect(adminApi.borrarProducto("p1")).resolves.toEqual({ eliminado: "logico" });
    expect(ultimaLlamada()[1].method).toBe("DELETE");
  });

  it("HU16 · cambiar el estado de un pedido hace PATCH con el estado", async () => {
    fetchMock.mockResolvedValue(respuesta({ id: "ped-1", estado: "coordinado" }));
    await adminApi.cambiarEstadoPedido("ped-1", "coordinado");

    const [url, init] = ultimaLlamada();
    expect(url).toBe(`${API_URL}/admin/orders/ped-1/estado`);
    expect(JSON.parse(init.body as string)).toEqual({ estado: "coordinado" });
  });

  it("RF10 · editar la configuración del sitio hace PUT en /admin/config", async () => {
    fetchMock.mockResolvedValue(respuesta({ whatsapp: "51999888777" }));
    await adminApi.editarConfig({ whatsapp: "51999888777" });

    const [url, init] = ultimaLlamada();
    expect(url).toBe(`${API_URL}/admin/config`);
    expect(init.method).toBe("PUT");
  });

  it("RF43 · editar categoría usa el slug en la ruta", async () => {
    fetchMock.mockResolvedValue(respuesta({ slug: "skincare" }));
    await adminApi.editarCategoria("skincare", { imagenUrl: null });
    expect(ultimaLlamada()[0]).toBe(`${API_URL}/admin/categories/skincare`);
  });

  it("las lecturas simples (pedidos, usuarios, categorías) usan GET sin cuerpo", async () => {
    fetchMock.mockResolvedValue(respuesta([]));
    await adminApi.pedidos();
    expect(ultimaLlamada()[1].method).toBeUndefined();
    await adminApi.usuarios();
    expect(ultimaLlamada()[0]).toBe(`${API_URL}/admin/users`);
    await adminApi.categorias();
    expect(ultimaLlamada()[0]).toBe(`${API_URL}/admin/categories`);
  });
});
