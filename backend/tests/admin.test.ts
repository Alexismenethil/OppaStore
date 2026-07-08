import "dotenv/config";
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import { firmarToken } from "../src/lib/jwt";
import { upsertUsuario } from "../src/lib/usuarios";

/**
 * Pruebas de integración del panel admin (RF42–RF48, HU08/HU09/HU13/HU16).
 * Cubre CP21 (acceso restringido), CP16 (crear/editar/estado) y CP17 (borrado
 * lógico oculto del catálogo). Requieren la base de datos levantada.
 */
const app = crearApp();

describe("API — panel admin (RF42–RF48)", () => {
  let adminToken: string;
  let clienteToken: string;

  beforeAll(async () => {
    const admin = await upsertUsuario({
      googleId: "admin:test-admin-panel",
      email: "jefa@oppastore.pe",
      nombre: "Jefa",
      esAdmin: true,
    });
    adminToken = firmarToken({ sub: admin.id, email: admin.email, nombre: admin.nombre, esAdmin: admin.esAdmin });
    // Cliente normal del sitio → token sin permisos admin.
    clienteToken = firmarToken({
      sub: "00000000-0000-0000-0000-000000000000",
      email: "cliente@oppa.dev",
      nombre: "Cliente",
      esAdmin: false,
    });
  });

  // ── CP21 · Acceso restringido ─────────────────────────────────────────────
  it("CP21 · GET /admin/products sin token responde 401", async () => {
    const res = await request(app).get("/api/v1/admin/products");
    expect(res.status).toBe(401);
  });

  it("CP21 · GET /admin/products con token no-admin responde 403", async () => {
    const res = await request(app)
      .get("/api/v1/admin/products")
      .set("Authorization", `Bearer ${clienteToken}`);
    expect(res.status).toBe(403);
  });

  it("GET /admin/products (admin) devuelve la lista, incluidos inactivos (RF48)", async () => {
    const res = await request(app)
      .get("/api/v1/admin/products")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // El seed incluye 'mascarilla-descontinuada' (activo:false).
    expect(res.body.some((p: { activo: boolean }) => p.activo === false)).toBe(true);
  });

  // ── CP16 · Crear / editar / estado ────────────────────────────────────────
  it("CP16 · crea, edita, cambia estado y borra un producto (RF43–RF46)", async () => {
    // Crear (RF43)
    const crear = await request(app)
      .post("/api/v1/admin/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nombre: "Producto de Prueba QA",
        descripcion: "Creado por la suite de pruebas.",
        precio: 30.5,
        stock: 10,
        categoriaSlug: "skincare",
        tipo: "skincare",
      });
    expect(crear.status).toBe(201);
    expect(crear.body.slug).toBe("producto-de-prueba-qa");
    const id = crear.body.id;

    // Editar precio y stock (RF44, RF46)
    const editar = await request(app)
      .put(`/api/v1/admin/products/${id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ precio: 45, stock: 3 });
    expect(editar.status).toBe(200);
    expect(Number(editar.body.precio)).toBe(45);
    expect(editar.body.stock).toBe(3);

    // Desactivar → oculto del catálogo público (CP17, RF45)
    const desactivar = await request(app)
      .patch(`/api/v1/admin/products/${id}/estado`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ activo: false });
    expect(desactivar.status).toBe(200);
    expect(desactivar.body.activo).toBe(false);

    const publico = await request(app).get("/api/v1/products");
    expect(publico.body.some((p: { id: string }) => p.id === id)).toBe(false);

    // Borrar (sin historial → físico)
    const borrar = await request(app)
      .delete(`/api/v1/admin/products/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(borrar.status).toBe(200);
    expect(borrar.body.eliminado).toBe("fisico");

    const adminList = await request(app)
      .get("/api/v1/admin/products")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(adminList.body.some((p: { id: string }) => p.id === id)).toBe(false);
  });

  it("valida el cuerpo al crear producto (400 en datos inválidos)", async () => {
    const res = await request(app)
      .post("/api/v1/admin/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nombre: "", precio: -5, stock: 1, categoriaSlug: "skincare", tipo: "skincare", descripcion: "x" });
    expect(res.status).toBe(400);
  });

  // ── HU16 · Historial de pedidos + estado ──────────────────────────────────
  it("HU16 · lista pedidos y actualiza su estado (RF48)", async () => {
    const prods = await request(app).get("/api/v1/products");
    const conStock = prods.body.find((p: { stock: number }) => p.stock > 0);
    await request(app)
      .post("/api/v1/orders")
      .send({ nombre: "Cliente QA", metodoEntrega: "recojo", items: [{ productoId: conStock.id, cantidad: 1 }] });

    const lista = await request(app)
      .get("/api/v1/admin/orders")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(lista.status).toBe(200);
    expect(lista.body.length).toBeGreaterThan(0);

    const cambio = await request(app)
      .patch(`/api/v1/admin/orders/${lista.body[0].id}/estado`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ estado: "coordinado" });
    expect(cambio.status).toBe(200);
    expect(cambio.body.estado).toBe("coordinado");
  });

  // ── Contenido del sitio ───────────────────────────────────────────────────
  it("PUT /admin/config actualiza y GET /config lo refleja (RF10)", async () => {
    const put = await request(app)
      .put("/api/v1/admin/config")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ instagram: "https://instagram.com/oppastore.qa", whatsapp: "51987654321" });
    expect(put.status).toBe(200);
    expect(put.body.instagram).toBe("https://instagram.com/oppastore.qa");

    const publico = await request(app).get("/api/v1/config");
    expect(publico.body.whatsapp).toBe("51987654321");
  });

  it("PUT /admin/categories/:slug edita la foto de la categoría (RF43)", async () => {
    const res = await request(app)
      .put("/api/v1/admin/categories/skincare")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ imagenUrl: "https://example.com/skincare-qa.jpg" });
    expect(res.status).toBe(200);
    expect(res.body.imagenUrl).toBe("https://example.com/skincare-qa.jpg");
  });

  it("GET /admin/users devuelve la lista de usuarios (RB23)", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.some((u: { email: string }) => u.email === "jefa@oppastore.pe")).toBe(true);
  });

  it("GET /admin/summary devuelve métricas del tablero", async () => {
    const res = await request(app)
      .get("/api/v1/admin/summary")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.productos).toHaveProperty("activos");
    expect(res.body.pedidos).toHaveProperty("total");
    expect(typeof res.body.ventas).toBe("number");
  });

  it("POST /admin/uploads/sign responde 501 si Cloudinary no está configurado", async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    const res = await request(app)
      .post("/api/v1/admin/uploads/sign")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(501);
  });

  // ── Home público ──────────────────────────────────────────────────────────
  it("GET /products/destacados devuelve los más pedidos (auto)", async () => {
    const res = await request(app).get("/api/v1/products/destacados?limit=4");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.length).toBeLessThanOrEqual(4);
  });

  it("GET /categories devuelve las categorías con foto", async () => {
    const res = await request(app).get("/api/v1/categories");
    expect(res.status).toBe(200);
    expect(res.body.some((c: { slug: string }) => c.slug === "skincare")).toBe(true);
  });
});
