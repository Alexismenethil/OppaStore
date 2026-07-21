import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import { borrarProducto, borrarUsuario, crearProducto, usuarioConToken } from "./helpers";

/**
 * Pruebas de integración de la sincronización de carrito y favoritos guardados
 * (RF37, RF39–RF41, RB17, RB21). Requieren la base de datos levantada.
 *
 * La suite crea su propio usuario y sus propios productos, y los elimina al
 * terminar para no dejar carritos ni favoritos huérfanos.
 */
const app = crearApp();

describe("API — carrito y favoritos guardados (RF39–RF41)", () => {
  let token: string;
  let usuarioId: string;
  let productoId: string;
  let segundoId: string;
  let inactivoId: string;
  const STOCK = 6;

  beforeAll(async () => {
    const sesion = await usuarioConToken("sync");
    token = sesion.token;
    usuarioId = sesion.usuario.id;

    productoId = (await crearProducto("sync-a", { stock: STOCK })).id;
    segundoId = (await crearProducto("sync-b", { stock: 4 })).id;
    inactivoId = (await crearProducto("sync-inactivo", { activo: false })).id;
  });

  afterAll(async () => {
    await borrarUsuario(usuarioId);
    for (const id of [productoId, segundoId, inactivoId]) await borrarProducto(id);
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  // ── Autenticación (RF38) ──────────────────────────────────────────────────
  it("GET /me/cart sin token responde 401 (RF38)", async () => {
    const res = await request(app).get("/api/v1/me/cart");
    expect(res.status).toBe(401);
  });

  it("todas las rutas de /me exigen sesión (401)", async () => {
    const rutas: [string, "get" | "put"][] = [
      ["/api/v1/me/cart", "get"],
      ["/api/v1/me/cart", "put"],
      ["/api/v1/me/favorites", "get"],
      ["/api/v1/me/favorites", "put"],
    ];
    for (const [ruta, metodo] of rutas) {
      const res = await request(app)[metodo](ruta).send({});
      expect(res.status, `${metodo.toUpperCase()} ${ruta}`).toBe(401);
    }
  });

  it("un token inválido también responde 401", async () => {
    const res = await request(app).get("/api/v1/me/cart").set("Authorization", "Bearer roto");
    expect(res.status).toBe(401);
  });

  // ── Carrito guardado ──────────────────────────────────────────────────────
  it("GET /me/cart devuelve una lista vacía para un usuario sin carrito", async () => {
    const nuevo = await usuarioConToken("sync-vacio");
    try {
      const res = await request(app)
        .get("/api/v1/me/cart")
        .set("Authorization", `Bearer ${nuevo.token}`);
      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    } finally {
      await borrarUsuario(nuevo.usuario.id);
    }
  });

  it("PUT y GET /me/cart hacen round-trip del carrito guardado (RB17)", async () => {
    const put = await request(app)
      .put("/api/v1/me/cart")
      .set(auth())
      .send({ items: [{ productoId, cantidad: 2 }] });
    expect(put.status).toBe(200);

    const get = await request(app).get("/api/v1/me/cart").set(auth());
    expect(get.status).toBe(200);
    expect(get.body.items).toEqual([{ productoId, cantidad: 2 }]);
  });

  it("RB21 · PUT /me/cart limita la cantidad al stock disponible", async () => {
    const put = await request(app)
      .put("/api/v1/me/cart")
      .set(auth())
      .send({ items: [{ productoId, cantidad: STOCK + 50 }] });

    expect(put.status).toBe(200);
    expect(put.body.items[0].cantidad).toBe(STOCK);
  });

  it("PUT /me/cart reemplaza el carrito completo, no acumula", async () => {
    await request(app)
      .put("/api/v1/me/cart")
      .set(auth())
      .send({ items: [{ productoId, cantidad: 1 }] });

    const segundo = await request(app)
      .put("/api/v1/me/cart")
      .set(auth())
      .send({ items: [{ productoId: segundoId, cantidad: 2 }] });

    expect(segundo.body.items).toEqual([{ productoId: segundoId, cantidad: 2 }]);
    const get = await request(app).get("/api/v1/me/cart").set(auth());
    expect(get.body.items).toEqual([{ productoId: segundoId, cantidad: 2 }]);
  });

  it("PUT /me/cart descarta productos inactivos o inexistentes (RB02, RB10)", async () => {
    const put = await request(app)
      .put("/api/v1/me/cart")
      .set(auth())
      .send({
        items: [
          { productoId, cantidad: 1 },
          { productoId: inactivoId, cantidad: 1 },
          { productoId: "producto-fantasma", cantidad: 1 },
        ],
      });

    expect(put.status).toBe(200);
    expect(put.body.items).toEqual([{ productoId, cantidad: 1 }]);
  });

  it("PUT /me/cart con lista vacía deja el carrito guardado vacío", async () => {
    await request(app)
      .put("/api/v1/me/cart")
      .set(auth())
      .send({ items: [{ productoId, cantidad: 1 }] });

    const vaciar = await request(app).put("/api/v1/me/cart").set(auth()).send({ items: [] });
    expect(vaciar.status).toBe(200);
    expect(vaciar.body.items).toEqual([]);

    const get = await request(app).get("/api/v1/me/cart").set(auth());
    expect(get.body.items).toEqual([]);
  });

  it("PUT /me/cart responde 400 con un cuerpo inválido", async () => {
    const sinItems = await request(app).put("/api/v1/me/cart").set(auth()).send({});
    expect(sinItems.status).toBe(400);
    expect(sinItems.body.error).toBe("Datos inválidos");

    const cantidadInvalida = await request(app)
      .put("/api/v1/me/cart")
      .set(auth())
      .send({ items: [{ productoId, cantidad: 0 }] });
    expect(cantidadInvalida.status).toBe(400);

    const decimal = await request(app)
      .put("/api/v1/me/cart")
      .set(auth())
      .send({ items: [{ productoId, cantidad: 1.5 }] });
    expect(decimal.status).toBe(400);
  });

  it("PUT /me/cart rechaza más de 200 líneas (límite de tamaño)", async () => {
    const items = Array.from({ length: 201 }, () => ({ productoId, cantidad: 1 }));
    const res = await request(app).put("/api/v1/me/cart").set(auth()).send({ items });
    expect(res.status).toBe(400);
  });

  // ── Favoritos guardados ───────────────────────────────────────────────────
  it("PUT y GET /me/favorites hacen round-trip sin duplicados (RB08)", async () => {
    const put = await request(app)
      .put("/api/v1/me/favorites")
      .set(auth())
      .send({ ids: [productoId, productoId] });
    expect(put.status).toBe(200);
    expect(put.body.ids).toEqual([productoId]);

    const get = await request(app).get("/api/v1/me/favorites").set(auth());
    expect(get.body.ids).toEqual([productoId]);
  });

  it("PUT /me/favorites ignora los ids de productos que no existen", async () => {
    const res = await request(app)
      .put("/api/v1/me/favorites")
      .set(auth())
      .send({ ids: [productoId, "producto-fantasma"] });

    expect(res.status).toBe(200);
    expect(res.body.ids).toEqual([productoId]);
  });

  it("PUT /me/favorites acepta un producto inactivo guardado previamente (RF36)", async () => {
    // Los favoritos conservan el producto aunque salga del catálogo público.
    const res = await request(app)
      .put("/api/v1/me/favorites")
      .set(auth())
      .send({ ids: [inactivoId] });
    expect(res.body.ids).toEqual([inactivoId]);
  });

  it("PUT /me/favorites con lista vacía limpia los favoritos", async () => {
    await request(app).put("/api/v1/me/favorites").set(auth()).send({ ids: [productoId] });
    const vaciar = await request(app).put("/api/v1/me/favorites").set(auth()).send({ ids: [] });
    expect(vaciar.body.ids).toEqual([]);

    const get = await request(app).get("/api/v1/me/favorites").set(auth());
    expect(get.body.ids).toEqual([]);
  });

  it("PUT /me/favorites responde 400 con un cuerpo inválido", async () => {
    const sinIds = await request(app).put("/api/v1/me/favorites").set(auth()).send({});
    expect(sinIds.status).toBe(400);

    const tipoIncorrecto = await request(app)
      .put("/api/v1/me/favorites")
      .set(auth())
      .send({ ids: [123] });
    expect(tipoIncorrecto.status).toBe(400);

    const demasiados = await request(app)
      .put("/api/v1/me/favorites")
      .set(auth())
      .send({ ids: Array.from({ length: 501 }, () => productoId) });
    expect(demasiados.status).toBe(400);
  });

  it("cada usuario ve solo su propio carrito y sus favoritos", async () => {
    const otro = await usuarioConToken("sync-otro");
    try {
      await request(app)
        .put("/api/v1/me/cart")
        .set(auth())
        .send({ items: [{ productoId, cantidad: 2 }] });

      const carritoAjeno = await request(app)
        .get("/api/v1/me/cart")
        .set("Authorization", `Bearer ${otro.token}`);
      expect(carritoAjeno.body.items).toEqual([]);

      const favoritosAjenos = await request(app)
        .get("/api/v1/me/favorites")
        .set("Authorization", `Bearer ${otro.token}`);
      expect(favoritosAjenos.body.ids).toEqual([]);
    } finally {
      await borrarUsuario(otro.usuario.id);
    }
  });
});
