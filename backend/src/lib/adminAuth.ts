import { timingSafeEqual } from "node:crypto";

interface CredencialesAdmin {
  email: string;
  password: string;
  nombre: string;
}

const ADMIN_DEV = {
  email: "admin@oppastore.pe",
  password: "Admin12345",
  nombre: "Administrador OppaStore",
};

function leerCredencialesAdmin(): CredencialesAdmin {
  const usarDevDefaults =
    process.env.NODE_ENV !== "production" &&
    process.env.ADMIN_LOGIN_EMAIL === undefined &&
    process.env.ADMIN_LOGIN_PASSWORD === undefined;

  if (usarDevDefaults) return ADMIN_DEV;

  return {
    email: (process.env.ADMIN_LOGIN_EMAIL ?? "").trim().toLowerCase(),
    password: process.env.ADMIN_LOGIN_PASSWORD ?? "",
    nombre: (process.env.ADMIN_LOGIN_NAME ?? ADMIN_DEV.nombre).trim() || ADMIN_DEV.nombre,
  };
}

function compararSeguro(a: string, b: string): boolean {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return timingSafeEqual(aa, bb);
}

export function adminLoginConfigurado(): boolean {
  const { email, password } = leerCredencialesAdmin();
  return email.length > 0 && password.length > 0;
}

export function datosAdminConfigurado() {
  const { email, nombre } = leerCredencialesAdmin();
  return { email, nombre };
}

export function credencialesAdminValidas(email: string, password: string): boolean {
  if (!adminLoginConfigurado()) return false;
  const cred = leerCredencialesAdmin();
  return compararSeguro(email.trim().toLowerCase(), cred.email) && compararSeguro(password, cred.password);
}
