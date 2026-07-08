import { prisma } from "./prisma";

/** ¿El correo está en la allowlist de administradores? (RF42, RB23 — Sprint 4). */
export function esCorreoAdmin(email: string): boolean {
  const lista = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return lista.includes(email.toLowerCase());
}

interface DatosUsuario {
  googleId: string;
  email: string;
  nombre: string;
  avatarUrl?: string | null;
}

/**
 * Crea o actualiza el usuario a partir de su identidad (Google o login de prueba).
 * El rol admin se deriva de la allowlist ADMIN_EMAILS (RB23), no se almacena a mano.
 */
export async function upsertUsuario(datos: DatosUsuario) {
  const esAdmin = esCorreoAdmin(datos.email);
  return prisma.usuario.upsert({
    where: { email: datos.email },
    update: { nombre: datos.nombre, avatarUrl: datos.avatarUrl ?? undefined, esAdmin },
    create: {
      googleId: datos.googleId,
      email: datos.email,
      nombre: datos.nombre,
      avatarUrl: datos.avatarUrl ?? undefined,
      esAdmin,
    },
  });
}
