import { Router } from "express";
import { prisma } from "../lib/prisma.js";

/**
 * Contenido público del sitio, editable desde el panel admin (Sprint 4):
 * configuración del footer/hero/drop (RF10) y categorías con su foto para el
 * home y el catálogo. Sin autenticación: son datos públicos de la tienda.
 */
export const siteRouter = Router();

/** GET /config — hero, contacto/redes del footer y drop del inicio. */
siteRouter.get("/config", async (_req, res, next) => {
  try {
    const cfg = await prisma.siteConfig.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });
    res.json(cfg);
  } catch (err) {
    next(err);
  }
});

/** GET /categories — categorías con foto/overlay para el home y el catálogo. */
siteRouter.get("/categories", async (_req, res, next) => {
  try {
    const cats = await prisma.categoria.findMany({
      orderBy: { orden: "asc" },
      select: { slug: true, nombre: true, imagenUrl: true, overlay: true, orden: true },
    });
    res.json(cats);
  } catch (err) {
    next(err);
  }
});
