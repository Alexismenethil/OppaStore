import "dotenv/config";
import { describe, it, expect, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import { firmarToken } from "../src/lib/jwt";
import { borrarUsuario, prisma, tokenSinUsuario, usuarioConToken } from "./helpers";

/**
 * Pruebas de integración de la sesión opcional (RF38). El login real de cliente
 * es Google; aquí se firma un JWT directamente (como haría el callback) para
 * ejercitar /me y la validación del token. El panel admin usa un login aparte
 * por correo y contraseña.
 *
 * Los usuarios y las variables de entorno que toca la suite se restauran al final.
 */
const app = crearApp();

const CREDENCIALES_ADMIN = {
  email: "admin@oppastore.pe",
  password: "Admin12345",
  nombre: "Administrador OppaStore",
};

const previas = {
  email: process.env.ADMIN_LOGIN_EMAIL,
  password: process.env.ADMIN_LOGIN_PASSWORD,
  nombre: process.env.ADMIN_LOGIN_NAME,
  googleId: process.env.GOOGLE_CLIENT_ID,
  googleSecret: process.env.GOOGLE_CLIENT_SECRET,
};

function restaurar(nombre: string, valor?: string) {
  if (valor === undefined) delete process.env[nombre];
  else process.env[nombre] = valor;
}

describe("API — sesión opcional (RF38)", () => {
  const usuariosCreados: string[] = [];

  beforeEach(() => {
    process.env.ADMIN_LOGIN_EMAIL = CREDENCIALES_ADMIN.email;
    process.env.ADMIN_LOGIN_PASSWORD = CREDENCIALES_ADMIN.password;
    process.env.ADMIN_LOGIN_NAME = CREDENCIALES_ADMIN.nombre;
  });

  afterAll(async () => {
    for (const id of usuariosCreados) await borrarUsuario(id);
    restaurar("ADMIN_LOGIN_EMAIL", previas.email);
    restaurar("ADMIN_LOGIN_PASSWORD", previas.password);
    restaurar("ADMIN_LOGIN_NAME", previas.nombre);
    restaurar("GOOGLE_CLIENT_ID", previas.googleId);
    restaurar("GOOGLE_CLIENT_SECRET", previas.googleSecret);
  });

  // ── GET /auth/me ──────────────────────────────────────────────────────────
  it("GET /auth/me sin token responde 401", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Sesión requerida");
  });

  it("GET /auth/me devuelve el usuario con un token válido", async () => {
    const { usuario, token } = await usuarioConToken("auth-cliente");
    usuariosCreados.push(usuario.id);

    const res = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.usuario.email).toBe(usuario.email);
    expect(res.body.usuario.esAdmin).toBe(false);
  });

  it("GET /auth/me no expone campos internos del usuario", async () => {
    const { usuario, token } = await usuarioConToken("auth-perfil");
    usuariosCreados.push(usuario.id);

    const res = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
    expect(Object.keys(res.body.usuario).sort()).toEqual(
      ["avatarUrl", "email", "esAdmin", "id", "nombre"].sort(),
    );
    expect(res.body.usuario).not.toHaveProperty("googleId");
  });

  it("GET /auth/me con token inválido responde 401", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer no-es-un-token");
    expect(res.status).toBe(401);
  });

  it("GET /auth/me rechaza un esquema distinto de Bearer (401)", async () => {
    const { usuario, token } = await usuarioConToken("auth-esquema");
    usuariosCreados.push(usuario.id);

    const basic = await request(app).get("/api/v1/auth/me").set("Authorization", `Basic ${token}`);
    expect(basic.status).toBe(401);

    const sinEsquema = await request(app).get("/api/v1/auth/me").set("Authorization", token);
    expect(sinEsquema.status).toBe(401);
  });

  it("GET /auth/me responde 404 si el token es válido pero el usuario ya no existe", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${tokenSinUsuario()}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Usuario no encontrado");
  });

  it("GET /auth/me rechaza un token manipulado (firma inválida)", async () => {
    const token = firmarToken({ sub: "u", email: "a@b.pe", nombre: "A", esAdmin: false });
    const manipulado = `${token.slice(0, -3)}abc`;
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${manipulado}`);
    expect(res.status).toBe(401);
  });

  // ── POST /auth/admin/login ────────────────────────────────────────────────
  it("POST /auth/admin/login emite una sesión admin válida", async () => {
    const res = await request(app).post("/api/v1/auth/admin/login").send(CREDENCIALES_ADMIN);

    expect(res.status).toBe(200);
    expect(res.body.usuario.email).toBe(CREDENCIALES_ADMIN.email);
    expect(res.body.usuario.esAdmin).toBe(true);
    expect(typeof res.body.token).toBe("string");
  });

  it("el token emitido sirve para consultar /auth/me como admin", async () => {
    const login = await request(app).post("/api/v1/auth/admin/login").send(CREDENCIALES_ADMIN);
    const me = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(me.status).toBe(200);
    expect(me.body.usuario.esAdmin).toBe(true);
  });

  it("POST /auth/admin/login rechaza credenciales inválidas", async () => {
    const res = await request(app).post("/api/v1/auth/admin/login").send({
      email: CREDENCIALES_ADMIN.email,
      password: "incorrecta",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Credenciales admin inválidas");
  });

  it("POST /auth/admin/login rechaza un correo que no es el del panel", async () => {
    const res = await request(app).post("/api/v1/auth/admin/login").send({
      email: "otro@oppastore.pe",
      password: CREDENCIALES_ADMIN.password,
    });
    expect(res.status).toBe(401);
  });

  it("POST /auth/admin/login acepta el correo en mayúsculas", async () => {
    const res = await request(app).post("/api/v1/auth/admin/login").send({
      email: "ADMIN@OPPASTORE.PE",
      password: CREDENCIALES_ADMIN.password,
    });
    expect(res.status).toBe(200);
  });

  it("POST /auth/admin/login responde 400 con datos mal formados", async () => {
    const sinPassword = await request(app)
      .post("/api/v1/auth/admin/login")
      .send({ email: CREDENCIALES_ADMIN.email });
    expect(sinPassword.status).toBe(400);
    expect(sinPassword.body.error).toBe("Datos inválidos");

    const correoInvalido = await request(app)
      .post("/api/v1/auth/admin/login")
      .send({ email: "no-es-un-correo", password: "x" });
    expect(correoInvalido.status).toBe(400);

    const vacio = await request(app).post("/api/v1/auth/admin/login").send({});
    expect(vacio.status).toBe(400);
  });

  it("POST /auth/admin/login responde 501 si el login admin no está configurado", async () => {
    process.env.ADMIN_LOGIN_EMAIL = "";
    process.env.ADMIN_LOGIN_PASSWORD = "";

    const res = await request(app).post("/api/v1/auth/admin/login").send(CREDENCIALES_ADMIN);
    expect(res.status).toBe(501);
    expect(res.body.error).toMatch(/no está configurado/i);
  });

  // ── Google OAuth (RF38) ───────────────────────────────────────────────────
  it("GET /auth/google responde 501 si Google no está configurado", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    const res = await request(app).get("/api/v1/auth/google").redirects(0);
    expect(res.status).toBe(501);
  });

  it("GET /auth/google/callback responde 501 si Google no está configurado", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    const res = await request(app).get("/api/v1/auth/google/callback?code=x").redirects(0);
    expect(res.status).toBe(501);
  });

  it("GET /auth/google redirige a Google con el destino interno en el state", async () => {
    process.env.GOOGLE_CLIENT_ID = "cliente-qa";
    process.env.GOOGLE_CLIENT_SECRET = "secreto-qa";

    const res = await request(app).get("/api/v1/auth/google?next=/admin/pedidos").redirects(0);
    expect(res.status).toBe(302);
    const destino = new URL(res.headers.location);
    expect(destino.origin).toBe("https://accounts.google.com");
    expect(destino.searchParams.get("state")).toBe("/admin/pedidos");
    expect(destino.searchParams.get("client_id")).toBe("cliente-qa");
  });

  it("GET /auth/google descarta un destino externo (open redirect)", async () => {
    process.env.GOOGLE_CLIENT_ID = "cliente-qa";
    process.env.GOOGLE_CLIENT_SECRET = "secreto-qa";

    const res = await request(app).get("/api/v1/auth/google?next=https://evil.com").redirects(0);
    expect(new URL(res.headers.location).searchParams.get("state")).toBe("/cuenta");
  });

  it("GET /auth/google/callback sin código vuelve al frontend con error", async () => {
    process.env.GOOGLE_CLIENT_ID = "cliente-qa";
    process.env.GOOGLE_CLIENT_SECRET = "secreto-qa";

    const res = await request(app).get("/api/v1/auth/google/callback").redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("error=sin_codigo");
  });

  it("RB20 · no se duplican cuentas con el mismo correo", async () => {
    const primero = await usuarioConToken("auth-upsert");
    const segundo = await usuarioConToken("auth-upsert");
    usuariosCreados.push(primero.usuario.id);

    expect(segundo.usuario.id).toBe(primero.usuario.id);
    expect(await prisma.usuario.count({ where: { email: primero.usuario.email } })).toBe(1);
  });
});
