import "dotenv/config";
import { describe, it, expect } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import { firmarToken } from "../src/lib/jwt";
import { upsertUsuario } from "../src/lib/usuarios";

/**
 * Pruebas de integración de la sesión opcional (RF38). El login real de cliente
 * es Google; aquí se firma un JWT directamente (como haría el callback) para
 * ejercitar /me y la validación del token. El panel admin usa un login aparte
 * por correo y contraseña.
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
    expect(res.body.usuario.esAdmin).toBe(false);
  });

  it("GET /auth/me con token inválido responde 401", async () => {
    const res = await request(app).get("/api/v1/auth/me").set("Authorization", "Bearer no-es-un-token");
    expect(res.status).toBe(401);
  });

  it("POST /auth/admin/login emite una sesión admin válida", async () => {
    process.env.ADMIN_LOGIN_EMAIL = "admin@oppastore.pe";
    process.env.ADMIN_LOGIN_PASSWORD = "Admin12345";
    process.env.ADMIN_LOGIN_NAME = "Administrador OppaStore";

    const res = await request(app).post("/api/v1/auth/admin/login").send({
      email: "admin@oppastore.pe",
      password: "Admin12345",
    });

    expect(res.status).toBe(200);
    expect(res.body.usuario.email).toBe("admin@oppastore.pe");
    expect(res.body.usuario.esAdmin).toBe(true);
    expect(typeof res.body.token).toBe("string");
  });

  it("POST /auth/admin/login rechaza credenciales inválidas", async () => {
    process.env.ADMIN_LOGIN_EMAIL = "admin@oppastore.pe";
    process.env.ADMIN_LOGIN_PASSWORD = "Admin12345";

    const res = await request(app).post("/api/v1/auth/admin/login").send({
      email: "admin@oppastore.pe",
      password: "incorrecta",
    });

    expect(res.status).toBe(401);
  });

  it("GET /auth/google responde 501 si Google no está configurado", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    const res = await request(app).get("/api/v1/auth/google").redirects(0);
    expect(res.status).toBe(501);
  });
});
