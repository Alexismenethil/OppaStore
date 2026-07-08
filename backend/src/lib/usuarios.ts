import { prisma } from "./prisma.js";

interface DatosUsuario {
  googleId: string;
  email: string;
  nombre: string;
  avatarUrl?: string | null;
  esAdmin?: boolean;
}

/**
 * Crea o actualiza el usuario a partir de su identidad. El login Google genera
 * cuentas cliente; el panel admin puede elevar la misma cuenta cuando entra con
 * correo y contraseña del panel.
 */
export async function upsertUsuario(datos: DatosUsuario) {
  const esAdmin = datos.esAdmin ?? false;
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
