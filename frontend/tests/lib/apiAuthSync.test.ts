import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchMe, loginAdmin, urlLoginGoogle } from "@/lib/api/auth";
import {
  getCartRemoto,
  putCartRemoto,
  getFavoritesRemoto,
  putFavoritesRemoto,
} from "@/lib/api/sync";
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
const TOKEN = "jwt-de-prueba";

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("lib/api/auth (RF38)", () => {
  it("fetchMe envía el token como Bearer y devuelve el usuario", async () => {
    fetchMock.mockResolvedValue(respuesta({ usuario: { id: "u1", email: "a@b.pe", esAdmin: false } }));
    const usuario = await fetchMe(TOKEN);
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    expect(usuario.email).toBe("a@b.pe");
  });

  it("fetchMe lanza 'Sesión inválida' con un token caducado (401)", async () => {
    fetchMock.mockResolvedValue(respuesta({ error: "Sesión requerida" }, 401));
    await expect(fetchMe("caducado")).rejects.toThrow("Sesión inválida");
  });

  it("loginAdmin envía correo y contraseña como JSON", async () => {
    fetchMock.mockResolvedValue(respuesta({ token: "t", usuario: { esAdmin: true } }));
    const sesion = await loginAdmin("admin@oppastore.pe", "Admin12345");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/auth/admin/login`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      email: "admin@oppastore.pe",
      password: "Admin12345",
    });
    expect(sesion.usuario.esAdmin).toBe(true);
  });

  it("loginAdmin propaga el mensaje del backend en credenciales inválidas (401)", async () => {
    fetchMock.mockResolvedValue(respuesta({ error: "Credenciales admin inválidas" }, 401));
    await expect(loginAdmin("admin@oppastore.pe", "mala")).rejects.toThrow(
      "Credenciales admin inválidas",
    );
  });

  it("loginAdmin usa un mensaje genérico si la respuesta no trae cuerpo", async () => {
    fetchMock.mockResolvedValue(respuestaSinJson(500));
    await expect(loginAdmin("a@b.pe", "x")).rejects.toThrow(/No se pudo iniciar sesión/);
  });

  it("urlLoginGoogle conserva un destino interno seguro", () => {
    expect(urlLoginGoogle("/admin/productos")).toBe(
      `${API_URL}/auth/google?next=%2Fadmin%2Fproductos`,
    );
  });

  it("urlLoginGoogle descarta destinos externos (open redirect)", () => {
    expect(urlLoginGoogle("https://evil.com")).toBe(`${API_URL}/auth/google`);
    expect(urlLoginGoogle("//evil.com")).toBe(`${API_URL}/auth/google`);
    expect(urlLoginGoogle()).toBe(`${API_URL}/auth/google`);
  });
});

describe("lib/api/sync (RF37, RF39)", () => {
  it("GET /me/cart devuelve los ítems guardados", async () => {
    fetchMock.mockResolvedValue(respuesta({ items: [{ productoId: "p1", cantidad: 2 }] }));
    await expect(getCartRemoto(TOKEN)).resolves.toEqual([{ productoId: "p1", cantidad: 2 }]);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      cache: "no-store",
    });
  });

  it("GET /me/cart lanza si la sesión no es válida (401)", async () => {
    fetchMock.mockResolvedValue(respuesta({ error: "Sesión requerida" }, 401));
    await expect(getCartRemoto("malo")).rejects.toThrow(/carrito guardado/);
  });

  it("PUT /me/cart reemplaza el carrito con el cuerpo esperado", async () => {
    fetchMock.mockResolvedValue(respuesta({ items: [] }));
    await putCartRemoto(TOKEN, [{ productoId: "p1", cantidad: 3 }]);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/me/cart`);
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toEqual({ items: [{ productoId: "p1", cantidad: 3 }] });
  });

  it("PUT /me/cart lanza si el servidor rechaza el guardado", async () => {
    fetchMock.mockResolvedValue(respuesta({ error: "Datos inválidos" }, 400));
    await expect(putCartRemoto(TOKEN, [])).rejects.toThrow(/guardar el carrito/);
  });

  it("GET /me/favorites devuelve los ids guardados", async () => {
    fetchMock.mockResolvedValue(respuesta({ ids: ["p1", "p2"] }));
    await expect(getFavoritesRemoto(TOKEN)).resolves.toEqual(["p1", "p2"]);
  });

  it("GET /me/favorites lanza sin sesión válida (401)", async () => {
    fetchMock.mockResolvedValue(respuesta({ error: "Sesión requerida" }, 401));
    await expect(getFavoritesRemoto("malo")).rejects.toThrow(/favoritos guardados/);
  });

  it("PUT /me/favorites envía la lista de ids", async () => {
    fetchMock.mockResolvedValue(respuesta({ ids: ["p1"] }));
    await putFavoritesRemoto(TOKEN, ["p1"]);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ ids: ["p1"] });
  });

  it("PUT /me/favorites lanza si el servidor rechaza el guardado", async () => {
    fetchMock.mockResolvedValue(respuesta({ error: "Datos inválidos" }, 400));
    await expect(putFavoritesRemoto(TOKEN, [])).rejects.toThrow(/guardar los favoritos/);
  });
});
