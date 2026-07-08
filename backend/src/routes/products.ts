import { Router } from "express";
import { prisma } from "../lib/prisma.js";

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

/**
 * GET /api/v1/products/destacados?limit= — "los más pedidos" del home, calculado
 * automáticamente por unidades vendidas (PedidoItem). Si aún no hay ventas
 * suficientes, completa con los productos marcados `destacado` y luego cualquiera
 * activo. Debe declararse antes de `/:slug` para no confundirse con un slug.
 */
productsRouter.get("/destacados", async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 4, 1), 12);

    const ventas = await prisma.pedidoItem.groupBy({
      by: ["productoId"],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: "desc" } },
      take: limit * 2,
    });

    const activos = await prisma.producto.findMany({
      where: { activo: true },
      include: { categoria: true },
    });
    const porId = new Map(activos.map((p) => [p.id, p]));

    const ordenados: typeof activos = [];
    const usados = new Set<string>();
    for (const v of ventas) {
      const p = porId.get(v.productoId);
      if (p && !usados.has(p.id)) {
        ordenados.push(p);
        usados.add(p.id);
      }
    }
    // Relleno: destacados manuales y luego el resto de activos (más recientes).
    for (const p of activos.filter((x) => x.destacado)) {
      if (!usados.has(p.id)) (ordenados.push(p), usados.add(p.id));
    }
    for (const p of [...activos].sort((a, b) => +b.createdAt - +a.createdAt)) {
      if (!usados.has(p.id)) (ordenados.push(p), usados.add(p.id));
    }

    res.json(ordenados.slice(0, limit));
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
