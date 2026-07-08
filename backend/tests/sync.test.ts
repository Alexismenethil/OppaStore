import "dotenv/config";
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import { firmarToken } from "../src/lib/jwt";
import { upsertUsuario } from "../src/lib/usuarios";

/**
 * Pruebas de integración de la sincronización de carrito y favoritos guardados
 * (RF37, RF39–RF41, RB17, RB21). Requieren la base de datos levantada.
 */
const app = crearApp();

interface ApiProducto {
  id: string;
  stock: number;
}

describe("API — carrito y favoritos guardados (RF39–RF41)", () => {
  let token: string;
  let producto: ApiProducto;

  beforeAll(async () => {
    const u = await upsertUsuario({
      googleId: "google:test-sync",
      email: "sync@oppa.dev",
      nombre: "Sync",
    });
    token = firmarToken({ sub: u.id, email: u.email, nombre: u.nombre, esAdmin: u.esAdmin });
    const prods = await request(app).get("/api/v1/products");
    producto = (prods.body as ApiProducto[]).find((p) => p.stock > 0)!;
    expect(producto).toBeTruthy();
  });

  it("GET /me/cart sin token responde 401 (RF38)", async () => {
    const res = await request(app).get("/api/v1/me/cart");
    expect(res.status).toBe(401);
  });

  it("PUT y GET /me/cart hacen round-trip del carrito guardado (RB17)", async () => {
    const put = await request(app)
      .put("/api/v1/me/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ productoId: producto.id, cantidad: 2 }] });
    expect(put.status).toBe(200);

    const get = await request(app).get("/api/v1/me/cart").set("Authorization", `Bearer ${token}`);
    expect(get.status).toBe(200);
    expect(get.body.items).toEqual([{ productoId: producto.id, cantidad: 2 }]);
  });

  it("RB21 · PUT /me/cart limita la cantidad al stock disponible", async () => {
    const put = await request(app)
      .put("/api/v1/me/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ productoId: producto.id, cantidad: producto.stock + 50 }] });

    expect(put.status).toBe(200);
    expect(put.body.items[0].cantidad).toBe(producto.stock);
  });

  it("PUT y GET /me/favorites hacen round-trip sin duplicados (RB08)", async () => {
    const put = await request(app)
      .put("/api/v1/me/favorites")
      .set("Authorization", `Bearer ${token}`)
      .send({ ids: [producto.id, producto.id] });
    expect(put.status).toBe(200);
    expect(put.body.ids).toEqual([producto.id]);

    const get = await request(app)
      .get("/api/v1/me/favorites")
      .set("Authorization", `Bearer ${token}`);
    expect(get.body.ids).toEqual([producto.id]);
  });
});
