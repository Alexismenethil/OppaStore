import { Router } from "express";
import { prisma } from "../lib/prisma";

export const productsRouter = Router();

/** GET /api/v1/products?categoria=&q= — solo productos activos (RB10, RF11–RF13). */
productsRouter.get("/", async (req, res, next) => {
  try {
    const { categoria, q } = req.query;
    const productos = await prisma.producto.findMany({
      where: {
        activo: true,
        ...(categoria ? { categoria: { slug: String(categoria) } } : {}),
        ...(q ? { nombre: { contains: String(q), mode: "insensitive" } } : {}),
      },
      include: { categoria: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(productos);
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/products/:slug — detalle (RF18, RF19). */
productsRouter.get("/:slug", async (req, res, next) => {
  try {
    const producto = await prisma.producto.findFirst({
      where: { slug: req.params.slug, activo: true },
      include: { categoria: true },
    });
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch (err) {
    next(err);
  }
});
