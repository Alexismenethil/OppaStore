import "dotenv/config";
import { describe, it, expect, vi } from "vitest";
import type { NextFunction, Response } from "express";
import { autenticar, soloAdmin, type ReqConUsuario } from "../src/middleware/auth";
import { firmarToken } from "../src/lib/jwt";

/**
 * Unitarias del middleware de sesión (RF38, RF42/CP21). Se prueba sin servidor:
 * `autenticar` exige un JWT válido y `soloAdmin` además exige el flag de admin.
 */

function contexto(authorization?: string) {
  const req = { headers: authorization ? { authorization } : {} } as unknown as ReqConUsuario;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next };
}

const tokenCliente = () =>
  firmarToken({ sub: "u-1", email: "cliente@oppa.dev", nombre: "Cliente", esAdmin: false });
const tokenAdmin = () =>
  firmarToken({ sub: "u-2", email: "admin@oppa.dev", nombre: "Admin", esAdmin: true });

describe("middleware/autenticar (RF38)", () => {
  it("sin cabecera Authorization responde 401 y corta la cadena", () => {
    const { req, res, next } = contexto();
    autenticar(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Sesión requerida" });
    expect(next).not.toHaveBeenCalled();
  });

  it("con un token válido adjunta el usuario y continúa", () => {
    const { req, res, next } = contexto(`Bearer ${tokenCliente()}`);
    autenticar(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.usuario).toMatchObject({ sub: "u-1", esAdmin: false });
    expect(res.status).not.toHaveBeenCalled();
  });

  it("rechaza tokens inválidos, vacíos o con otro esquema", () => {
    for (const cabecera of ["Bearer ", "Bearer roto", "Basic abc", tokenCliente()]) {
      const { req, res, next } = contexto(cabecera);
      autenticar(req, res, next);
      expect(res.status, `cabecera "${cabecera}"`).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    }
  });
});

describe("middleware/soloAdmin (RF42, CP21, RB23)", () => {
  it("sin token responde 401 (no 403)", () => {
    const { req, res, next } = contexto();
    soloAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("CP21 · con una sesión de cliente responde 403", () => {
    const { req, res, next } = contexto(`Bearer ${tokenCliente()}`);
    soloAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Acceso restringido a administradores" });
    expect(next).not.toHaveBeenCalled();
  });

  it("con una sesión admin adjunta el usuario y continúa", () => {
    const { req, res, next } = contexto(`Bearer ${tokenAdmin()}`);
    soloAdmin(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.usuario?.esAdmin).toBe(true);
  });

  it("un token inválido responde 401 aunque diga ser admin", () => {
    const { req, res, next } = contexto("Bearer no-es-un-token");
    soloAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
