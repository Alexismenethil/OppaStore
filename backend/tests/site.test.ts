import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import { prisma, snapshotSiteConfig } from "./helpers";

/**
 * Contenido público del sitio (RF10, Sprint 4): configuración del hero/footer y
 * categorías con foto. Son datos públicos: no exigen autenticación.
 * La configuración es un singleton, por lo que la prueba toma un snapshot y lo
 * restaura al terminar.
 */
const app = crearApp();

describe("API — contenido público del sitio (RF10)", () => {
  let restaurar: () => Promise<void>;

  beforeAll(async () => {
    restaurar = await snapshotSiteConfig();
  });

  afterAll(async () => {
    await restaurar();
  });

  it("GET /config responde 200 sin autenticación", async () => {
    const res = await request(app).get("/api/v1/config");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("default");
  });

  it("GET /config expone los campos del footer y del hero (RF10)", async () => {
    const res = await request(app).get("/api/v1/config");
    for (const campo of [
      "heroFlatLayUrl",
      "heroPandaUrl",
      "heroPandaEtiqueta",
      "dropHomeProductoId",
      "whatsapp",
      "email",
      "facebook",
      "instagram",
      "tiktok",
      "direccion",
    ]) {
      expect(res.body).toHaveProperty(campo);
    }
  });

  it("GET /config crea la configuración por defecto si aún no existe (upsert)", async () => {
    await prisma.siteConfig.deleteMany({ where: { id: "default" } });

    const res = await request(app).get("/api/v1/config");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("default");
    expect(res.body.whatsapp).toBeNull();
  });

  it("GET /categories responde 200 con las categorías ordenadas", async () => {
    const res = await request(app).get("/api/v1/categories");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    const ordenes = res.body.map((c: { orden: number }) => c.orden);
    expect(ordenes).toEqual([...ordenes].sort((a, b) => a - b));
  });

  it("GET /categories solo expone los campos públicos necesarios", async () => {
    const res = await request(app).get("/api/v1/categories");
    expect(Object.keys(res.body[0]).sort()).toEqual(
      ["imagenUrl", "nombre", "orden", "overlay", "slug"].sort(),
    );
  });

  it("las categorías del seed están disponibles para el catálogo", async () => {
    const res = await request(app).get("/api/v1/categories");
    const slugs = res.body.map((c: { slug: string }) => c.slug);
    expect(slugs).toEqual(expect.arrayContaining(["skincare", "snacks", "peluches"]));
  });

  it("los endpoints públicos no requieren cabecera Authorization", async () => {
    const config = await request(app).get("/api/v1/config").set("Authorization", "");
    const categorias = await request(app).get("/api/v1/categories");
    expect(config.status).toBe(200);
    expect(categorias.status).toBe(200);
  });
});
