import "dotenv/config";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { adminLoginConfigurado, credencialesAdminValidas, datosAdminConfigurado } from "../src/lib/adminAuth";

const previo = {
  email: process.env.ADMIN_LOGIN_EMAIL,
  password: process.env.ADMIN_LOGIN_PASSWORD,
  nombre: process.env.ADMIN_LOGIN_NAME,
};

function restaurar(nombre: "ADMIN_LOGIN_EMAIL" | "ADMIN_LOGIN_PASSWORD" | "ADMIN_LOGIN_NAME", valor?: string) {
  if (valor === undefined) delete process.env[nombre];
  else process.env[nombre] = valor;
}

describe("adminAuth", () => {
  beforeEach(() => {
    process.env.ADMIN_LOGIN_EMAIL = "admin@oppastore.pe";
    process.env.ADMIN_LOGIN_PASSWORD = "Admin12345";
    process.env.ADMIN_LOGIN_NAME = "Administrador OppaStore";
  });

  afterEach(() => {
    restaurar("ADMIN_LOGIN_EMAIL", previo.email);
    restaurar("ADMIN_LOGIN_PASSWORD", previo.password);
    restaurar("ADMIN_LOGIN_NAME", previo.nombre);
  });

  it("detecta si el login admin está configurado", () => {
    expect(adminLoginConfigurado()).toBe(true);

    process.env.ADMIN_LOGIN_PASSWORD = "";
    expect(adminLoginConfigurado()).toBe(false);
  });

  it("normaliza y expone los datos del admin configurado", () => {
    process.env.ADMIN_LOGIN_EMAIL = " ADMIN@OppaStore.Pe ";
    expect(datosAdminConfigurado()).toEqual({
      email: "admin@oppastore.pe",
      nombre: "Administrador OppaStore",
    });
  });

  it("valida correo y contraseña exactos del panel", () => {
    expect(credencialesAdminValidas("admin@oppastore.pe", "Admin12345")).toBe(true);
    expect(credencialesAdminValidas("ADMIN@OPPASTORE.PE", "Admin12345")).toBe(true);
    expect(credencialesAdminValidas("admin@oppastore.pe", "otra")).toBe(false);
    expect(credencialesAdminValidas("otro@oppastore.pe", "Admin12345")).toBe(false);
  });

  it("usa credenciales locales por defecto si desarrollo arranca sin .env", () => {
    delete process.env.ADMIN_LOGIN_EMAIL;
    delete process.env.ADMIN_LOGIN_PASSWORD;
    delete process.env.ADMIN_LOGIN_NAME;

    expect(adminLoginConfigurado()).toBe(true);
    expect(datosAdminConfigurado()).toEqual({
      email: "admin@oppastore.pe",
      nombre: "Administrador OppaStore",
    });
    expect(credencialesAdminValidas("admin@oppastore.pe", "Admin12345")).toBe(true);
  });
});
