import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { autenticar, type ReqConUsuario } from "../middleware/auth";

/**
 * Sincronización del carrito y favoritos del usuario autenticado (RF37, RF39–RF41).
 * Persiste el estado en la BD para recuperarlo al volver a iniciar sesión (RB17).
 * El merge de invitado ocurre en el cliente con las reglas de dominio (RB21, CP19)
 * y aquí se re-valida el stock (RB21) de forma defensiva.
 */
export const syncRouter = Router();

syncRouter.use(autenticar);

const cartSchema = z.object({
  items: z
    .array(z.object({ productoId: z.string(), cantidad: z.number().int().positive() }))
    .max(200),
});

const favSchema = z.object({
  ids: z.array(z.string()).max(500),
});

/** GET /me/cart — carrito guardado del usuario. */
syncRouter.get("/cart", async (req: ReqConUsuario, res, next) => {
  try {
    const carrito = await prisma.carrito.findUnique({
      where: { usuarioId: req.usuario!.sub },
      include: { items: true },
    });
    res.json({ items: (carrito?.items ?? []).map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })) });
  } catch (err) {
    next(err);
  }
});

/** PUT /me/cart — reemplaza el carrito guardado (clamp de stock, ignora inactivos). */
syncRouter.put("/cart", async (req: ReqConUsuario, res, next) => {
  try {
    const { items } = cartSchema.parse(req.body);
    const usuarioId = req.usuario!.sub;

    const productos = await prisma.producto.findMany({
      where: { id: { in: items.map((i) => i.productoId) }, activo: true },
      select: { id: true, stock: true },
    });
    const stockPorId = new Map(productos.map((p) => [p.id, p.stock]));

    const validos = items
      .filter((i) => stockPorId.has(i.productoId))
      .map((i) => ({
        productoId: i.productoId,
        cantidad: Math.min(i.cantidad, stockPorId.get(i.productoId)!), // RB21
      }))
      .filter((i) => i.cantidad > 0);

    const carrito = await prisma.carrito.upsert({
      where: { usuarioId },
      update: {},
      create: { usuarioId },
    });

    await prisma.$transaction([
      prisma.carritoItem.deleteMany({ where: { carritoId: carrito.id } }),
      ...validos.map((v) =>
        prisma.carritoItem.create({
          data: { carritoId: carrito.id, productoId: v.productoId, cantidad: v.cantidad },
        }),
      ),
    ]);

    res.json({ items: validos });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Datos inválidos", detalles: err.flatten() });
    }
    next(err);
  }
});

/** GET /me/favorites — favoritos guardados del usuario (RF36). */
syncRouter.get("/favorites", async (req: ReqConUsuario, res, next) => {
  try {
    const favoritos = await prisma.favorito.findMany({
      where: { usuarioId: req.usuario!.sub },
      select: { productoId: true },
    });
    res.json({ ids: favoritos.map((f) => f.productoId) });
  } catch (err) {
    next(err);
  }
});

/** PUT /me/favorites — reemplaza los favoritos (sin duplicados, RB08). */
syncRouter.put("/favorites", async (req: ReqConUsuario, res, next) => {
  try {
    const { ids } = favSchema.parse(req.body);
    const usuarioId = req.usuario!.sub;

    const existentes = await prisma.producto.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const validos = [...new Set(existentes.map((p) => p.id))];

    await prisma.$transaction([
      prisma.favorito.deleteMany({ where: { usuarioId } }),
      ...validos.map((productoId) =>
        prisma.favorito.create({ data: { usuarioId, productoId } }),
      ),
    ]);

    res.json({ ids: validos });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Datos inválidos", detalles: err.flatten() });
    }
    next(err);
  }
});
