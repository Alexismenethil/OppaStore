import "dotenv/config";
import { describe, it, expect } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import { firmarToken } from "../src/lib/jwt";
import { upsertUsuario, esCorreoAdmin } from "../src/lib/usuarios";

/**
 * Pruebas de integración de la sesión opcional (RF38). El login real es Google;
 * aquí se firma un JWT directamente (como haría el callback) para ejercitar /me,
 * la validación del token y la derivación de admin desde la allowlist (RB23,
 * base del control de acceso CP21 del Sprint 4). Requieren la base de datos.
 */
const app = crearApp();

describe("API — sesión opcional (RF38)", () => {
  it("GET /auth/me sin token responde 401", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /auth/me devuelve el usuario con un token válido", async () => {
    const u = await upsertUsuario({
      googleId: "google:test-cliente",
      email: "cliente@oppa.dev",
      nombre: "Cliente Prueba",
    });
    const token = firmarToken({ sub: u.id, email: u.email, nombre: u.nombre, esAdmin: u.esAdmin });

    const res = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.usuario.email).toBe("cliente@oppa.dev");
  });

  it("GET /auth/me con token inválido responde 401", async () => {
    const res = await request(app).get("/api/v1/auth/me").set("Authorization", "Bearer no-es-un-token");
    expect(res.status).toBe(401);
  });

  it("RB23 · esAdmin se deriva de la allowlist ADMIN_EMAILS", async () => {
    process.env.ADMIN_EMAILS = "jefa@oppastore.pe";
    expect(esCorreoAdmin("jefa@oppastore.pe")).toBe(true);
    expect(esCorreoAdmin("otro@correo.com")).toBe(false);

    const u = await upsertUsuario({
      googleId: "google:test-admin",
      email: "jefa@oppastore.pe",
      nombre: "Jefa",
    });
    expect(u.esAdmin).toBe(true);
  });

  it("GET /auth/google responde 501 si Google no está configurado", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    const res = await request(app).get("/api/v1/auth/google").redirects(0);
    expect(res.status).toBe(501);
  });
});
