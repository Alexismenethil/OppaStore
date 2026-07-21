import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { firmarToken } from "../src/lib/jwt";
import { upsertUsuario } from "../src/lib/usuarios";

/**
 * Utilidades compartidas por las pruebas de integración.
 *
 * Regla del proyecto: **toda prueba que escriba en PostgreSQL debe dejar la base
 * como la encontró**. Los helpers de abajo crean datos con nombres/slugs
 * marcados como `qa-*` y ofrecen su limpieza correspondiente, para que ninguna
 * prueba dependa de otra ni contamine los E2E.
 */

/** Prefijo reservado para los datos creados por la suite. */
export const PREFIJO_QA = "qa-test";

export { prisma };

/** Devuelve el id de una categoría existente del seed. */
export async function idCategoria(slug = "skincare"): Promise<string> {
  const cat = await prisma.categoria.findUnique({ where: { slug }, select: { id: true } });
  if (!cat) throw new Error(`Falta la categoría "${slug}" (¿corriste el seed?)`);
  return cat.id;
}

interface OpcionesProducto {
  nombre?: string;
  precio?: number;
  stock?: number;
  activo?: boolean;
  destacado?: boolean;
  esPreventa?: boolean;
  categoriaSlug?: string;
}

/**
 * Crea un producto exclusivo de la prueba (slug único con `PREFIJO_QA`).
 * Se elimina con `borrarProducto`.
 */
export async function crearProducto(sufijo: string, opciones: OpcionesProducto = {}) {
  const slug = `${PREFIJO_QA}-${sufijo}`;
  return prisma.producto.create({
    data: {
      slug,
      nombre: opciones.nombre ?? `Producto QA ${sufijo}`,
      descripcion: "Producto creado por la suite de pruebas.",
      precio: opciones.precio ?? 25,
      stock: opciones.stock ?? 10,
      activo: opciones.activo ?? true,
      destacado: opciones.destacado ?? false,
      esPreventa: opciones.esPreventa ?? false,
      tipo: "general",
      categoriaId: await idCategoria(opciones.categoriaSlug),
    },
  });
}

/** Elimina un producto de prueba junto con sus referencias. */
export async function borrarProducto(id: string) {
  await prisma.pedidoItem.deleteMany({ where: { productoId: id } });
  await prisma.carritoItem.deleteMany({ where: { productoId: id } });
  await prisma.favorito.deleteMany({ where: { productoId: id } });
  await prisma.producto.deleteMany({ where: { id } });
}

/** Elimina los pedidos indicados (sus `pedido_items` caen en cascada). */
export async function borrarPedidos(ids: string[]) {
  if (ids.length === 0) return;
  await prisma.pedido.deleteMany({ where: { id: { in: ids } } });
}

/** Elimina todos los pedidos cuyo cliente empiece por el prefijo indicado. */
export async function borrarPedidosDeCliente(prefijoNombre: string) {
  await prisma.pedido.deleteMany({ where: { nombreCliente: { startsWith: prefijoNombre } } });
}

/** Crea (o reutiliza) un usuario de prueba y devuelve su token JWT. */
export async function usuarioConToken(sufijo: string, esAdmin = false) {
  const usuario = await upsertUsuario({
    googleId: `${PREFIJO_QA}:${sufijo}`,
    email: `${PREFIJO_QA}-${sufijo}@oppa.dev`,
    nombre: `QA ${sufijo}`,
    esAdmin,
  });
  return {
    usuario,
    token: firmarToken({
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      esAdmin: usuario.esAdmin,
    }),
  };
}

/** Elimina un usuario de prueba y todo lo que cuelga de él. */
export async function borrarUsuario(id: string) {
  await prisma.favorito.deleteMany({ where: { usuarioId: id } });
  const carrito = await prisma.carrito.findUnique({ where: { usuarioId: id } });
  if (carrito) {
    await prisma.carritoItem.deleteMany({ where: { carritoId: carrito.id } });
    await prisma.carrito.delete({ where: { id: carrito.id } });
  }
  await prisma.pedido.updateMany({ where: { usuarioId: id }, data: { usuarioId: null } });
  await prisma.usuario.deleteMany({ where: { id } });
}

/** Token de un cliente que NO existe en la BD (para probar 403/404). */
export function tokenSinUsuario(esAdmin = false): string {
  return firmarToken({
    sub: "00000000-0000-0000-0000-000000000000",
    email: `${PREFIJO_QA}-fantasma@oppa.dev`,
    nombre: "Fantasma",
    esAdmin,
  });
}

/** Guarda la configuración del sitio y devuelve una función para restaurarla. */
export async function snapshotSiteConfig() {
  const previo = await prisma.siteConfig.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  const { id: _id, updatedAt: _updatedAt, ...campos } = previo;
  return async () => {
    await prisma.siteConfig.update({ where: { id: "default" }, data: campos });
  };
}
