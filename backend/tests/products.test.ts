import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import { borrarProducto, crearProducto } from "./helpers";

/**
 * Catálogo público (RF11–RF13, RF18, RF48). Requiere PostgreSQL levantado y
 * sembrado. Los productos que crea esta suite llevan slug `qa-test-*` y se
 * eliminan en `afterAll` para no afectar a otras pruebas ni a los E2E.
 */
const app = crearApp();

interface ApiProducto {
  id: string;
  slug: string;
  nombre: string;
  precio: string;
  stock: number;
  activo: boolean;
  categoria?: { slug: string; nombre: string };
}

describe("API — catálogo público (RF11–RF13, RF18)", () => {
  const creados: string[] = [];
  let activo: ApiProducto;

  beforeAll(async () => {
    const visible = await crearProducto("catalogo-visible", {
      nombre: "Mascarilla QA Visible",
      precio: 39.9,
      stock: 7,
      categoriaSlug: "skincare",
    });
    const oculto = await crearProducto("catalogo-oculto", {
      nombre: "Mascarilla QA Oculta",
      activo: false,
      categoriaSlug: "skincare",
    });
    const otraCategoria = await crearProducto("catalogo-peluche", {
      nombre: "Peluche QA Nube",
      categoriaSlug: "peluches",
    });
    creados.push(visible.id, oculto.id, otraCategoria.id);
    activo = { ...visible, precio: String(visible.precio) } as unknown as ApiProducto;
  });

  afterAll(async () => {
    for (const id of creados) await borrarProducto(id);
  });

  // ── GET /products ─────────────────────────────────────────────────────────
  it("GET /products devuelve 200 con la lista de productos activos", async () => {
    const res = await request(app).get("/api/v1/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("CP01 · RB10 · el catálogo público nunca incluye productos inactivos", async () => {
    const res = await request(app).get("/api/v1/products");
    const inactivos = (res.body as ApiProducto[]).filter((p) => !p.activo);
    expect(inactivos).toEqual([]);
    expect((res.body as ApiProducto[]).some((p) => p.slug === "qa-test-catalogo-oculto")).toBe(false);
  });

  it("cada producto incluye su categoría relacionada y el precio serializado", async () => {
    const res = await request(app).get("/api/v1/products");
    const producto = (res.body as ApiProducto[]).find((p) => p.slug === "qa-test-catalogo-visible")!;
    expect(producto.categoria?.slug).toBe("skincare");
    expect(Number(producto.precio)).toBe(39.9);
    expect(producto.stock).toBe(7);
  });

  // ── Filtro por categoría (RF12) ───────────────────────────────────────────
  it("CP02 · filtra por categoría devolviendo solo esa categoría", async () => {
    const res = await request(app).get("/api/v1/products?categoria=peluches");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect((res.body as ApiProducto[]).every((p) => p.categoria?.slug === "peluches")).toBe(true);
  });

  it("una categoría inexistente devuelve 200 con lista vacía (no 404)", async () => {
    const res = await request(app).get("/api/v1/products?categoria=categoria-inventada");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("categoría vacía se ignora y devuelve todo el catálogo activo", async () => {
    const todos = await request(app).get("/api/v1/products");
    const res = await request(app).get("/api/v1/products?categoria=");
    expect(res.body).toHaveLength(todos.body.length);
  });

  // ── Búsqueda por nombre (RF13) ────────────────────────────────────────────
  it("CP03 · busca por nombre sin distinguir mayúsculas", async () => {
    const res = await request(app).get("/api/v1/products?q=MASCARILLA+QA");
    expect(res.status).toBe(200);
    expect((res.body as ApiProducto[]).map((p) => p.slug)).toEqual(["qa-test-catalogo-visible"]);
  });

  it("busca por una subcadena en medio del nombre", async () => {
    const res = await request(app).get("/api/v1/products?q=QA%20Nube");
    expect((res.body as ApiProducto[]).map((p) => p.slug)).toEqual(["qa-test-catalogo-peluche"]);
  });

  it("la búsqueda no devuelve inactivos aunque coincidan (RB10)", async () => {
    const res = await request(app).get("/api/v1/products?q=QA%20Oculta");
    expect(res.body).toEqual([]);
  });

  it("una búsqueda sin coincidencias devuelve 200 y lista vacía", async () => {
    const res = await request(app).get("/api/v1/products?q=zzz-no-existe-zzz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("combina categoría y búsqueda", async () => {
    const conjunto = await request(app).get("/api/v1/products?categoria=skincare&q=QA%20Visible");
    expect((conjunto.body as ApiProducto[]).map((p) => p.slug)).toEqual(["qa-test-catalogo-visible"]);

    // La misma búsqueda en otra categoría no devuelve nada.
    const vacio = await request(app).get("/api/v1/products?categoria=peluches&q=QA%20Visible");
    expect(vacio.body).toEqual([]);
  });

  // ── Detalle (RF18) ────────────────────────────────────────────────────────
  it("CP18 · GET /products/:slug devuelve el detalle de un producto activo", async () => {
    const res = await request(app).get(`/api/v1/products/${activo.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe("Mascarilla QA Visible");
    expect(res.body.categoria.slug).toBe("skincare");
  });

  it("GET /products/:slug responde 404 con un slug inexistente", async () => {
    const res = await request(app).get("/api/v1/products/slug-que-no-existe");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Producto no encontrado");
  });

  it("RB10 · el detalle de un producto inactivo también responde 404", async () => {
    const res = await request(app).get("/api/v1/products/qa-test-catalogo-oculto");
    expect(res.status).toBe(404);
  });

  // ── Destacados (RF48) ─────────────────────────────────────────────────────
  it("RF48 · GET /products/destacados no se confunde con la ruta /:slug", async () => {
    const res = await request(app).get("/api/v1/products/destacados");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("respeta el límite solicitado", async () => {
    const res = await request(app).get("/api/v1/products/destacados?limit=2");
    expect(res.body).toHaveLength(2);
  });

  it("acota el límite al rango [1, 12]", async () => {
    const cero = await request(app).get("/api/v1/products/destacados?limit=0");
    expect(cero.body.length).toBeGreaterThanOrEqual(1);

    const negativo = await request(app).get("/api/v1/products/destacados?limit=-5");
    expect(negativo.body).toHaveLength(1);

    const enorme = await request(app).get("/api/v1/products/destacados?limit=999");
    expect(enorme.body.length).toBeLessThanOrEqual(12);
  });

  it("un límite no numérico cae al valor por defecto (4)", async () => {
    const res = await request(app).get("/api/v1/products/destacados?limit=abc");
    expect(res.body).toHaveLength(4);
  });

  it("los destacados solo incluyen productos activos y sin repetir (RB10)", async () => {
    const res = await request(app).get("/api/v1/products/destacados?limit=12");
    const ids = (res.body as ApiProducto[]).map((p) => p.id);
    expect((res.body as ApiProducto[]).every((p) => p.activo)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
