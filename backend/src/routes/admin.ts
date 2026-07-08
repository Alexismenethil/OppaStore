import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { soloAdmin } from "../middleware/auth.js";
import { generarSlug } from "../lib/slug.js";
import { cloudinaryConfigurado, firmarSubida } from "../lib/cloudinary.js";

/**
 * Panel administrador (RF42–RF48, HU08/HU09/HU13/HU16). Toda la ruta exige una
 * sesión admin válida (CP21). Cubre CRUD de productos con borrado lógico
 * (CP17), gestión de contenido del inicio/footer, historial de pedidos y un
 * tablero con métricas. Las fotos se suben a Cloudinary (RF43).
 */
export const adminRouter = Router();

adminRouter.use(soloAdmin);

const UMBRAL_STOCK_BAJO = 5;
const TIPOS = ["skincare", "snack", "peluche", "accesorio", "coleccion", "drop", "general"] as const;

const fechaOpcional = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v ? new Date(v) : null));

const infoSchema = z
  .object({
    tipoPiel: z.string().optional(),
    modoUso: z.string().optional(),
    advertencia: z.string().optional(),
    alergenos: z.string().optional(),
  })
  .partial()
  .optional()
  .nullable();

const baseProducto = {
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria"),
  precio: z.coerce.number().positive("El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  categoriaSlug: z.string().min(1, "La categoría es obligatoria"),
  tipo: z.enum(TIPOS),
  imagenUrl: z.string().url().optional().nullable(),
  imagenes: z.array(z.string().url()).max(8).optional(),
  activo: z.boolean().optional(),
  destacado: z.boolean().optional(),
  esPreventa: z.boolean().optional(),
  fechaEstimadaLlegada: fechaOpcional,
  fechaVencimiento: fechaOpcional,
  infoAdicional: infoSchema,
};

const crearProductoSchema = z.object(baseProducto);
const editarProductoSchema = z.object(baseProducto).partial();

/** Resuelve el id de categoría por slug (400 si no existe). */
async function idCategoria(slug: string): Promise<string | null> {
  const cat = await prisma.categoria.findUnique({ where: { slug }, select: { id: true } });
  return cat?.id ?? null;
}

/** Construye el objeto de datos de Prisma a partir del cuerpo validado. */
function datosProducto(
  body: z.infer<typeof editarProductoSchema>,
  categoriaId?: string,
): Prisma.ProductoUncheckedUpdateInput {
  const data: Prisma.ProductoUncheckedUpdateInput = {};
  if (body.nombre !== undefined) data.nombre = body.nombre;
  if (body.descripcion !== undefined) data.descripcion = body.descripcion;
  if (body.precio !== undefined) data.precio = body.precio;
  if (body.stock !== undefined) data.stock = body.stock;
  if (categoriaId) data.categoriaId = categoriaId;
  if (body.tipo !== undefined) data.tipo = body.tipo;
  if (body.imagenUrl !== undefined) data.imagenUrl = body.imagenUrl;
  if (body.imagenes !== undefined) data.imagenes = body.imagenes;
  if (body.activo !== undefined) data.activo = body.activo;
  if (body.destacado !== undefined) data.destacado = body.destacado;
  if (body.esPreventa !== undefined) data.esPreventa = body.esPreventa;
  if (body.fechaEstimadaLlegada !== undefined) data.fechaEstimadaLlegada = body.fechaEstimadaLlegada;
  if (body.fechaVencimiento !== undefined) data.fechaVencimiento = body.fechaVencimiento;
  if (body.infoAdicional !== undefined) {
    data.infoAdicional = (body.infoAdicional ?? Prisma.JsonNull) as Prisma.InputJsonValue;
  }
  return data;
}

// ─── Productos ──────────────────────────────────────────────────────────────

/** GET /admin/products — todos los productos, incluidos inactivos (RF48). */
adminRouter.get("/products", async (_req, res, next) => {
  try {
    const productos = await prisma.producto.findMany({
      include: { categoria: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(productos);
  } catch (err) {
    next(err);
  }
});

/** POST /admin/products — crea un producto con slug único autogenerado (RF43). */
adminRouter.post("/products", async (req, res, next) => {
  try {
    const body = crearProductoSchema.parse(req.body);
    const categoriaId = await idCategoria(body.categoriaSlug);
    if (!categoriaId) return res.status(400).json({ error: "La categoría no existe" });

    let slug = generarSlug(body.nombre) || "producto";
    const base = slug;
    for (let i = 2; await prisma.producto.findUnique({ where: { slug } }); i++) {
      slug = `${base}-${i}`;
    }

    const data = datosProducto(body, categoriaId) as Prisma.ProductoUncheckedCreateInput;
    const producto = await prisma.producto.create({
      data: { ...data, slug, nombre: body.nombre, descripcion: body.descripcion, precio: body.precio, stock: body.stock, tipo: body.tipo, categoriaId },
      include: { categoria: true },
    });
    res.status(201).json(producto);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Datos inválidos", detalles: err.flatten() });
    }
    next(err);
  }
});

/** PUT /admin/products/:id — edita un producto (RF44, RF46, RF47). */
adminRouter.put("/products/:id", async (req, res, next) => {
  try {
    const body = editarProductoSchema.parse(req.body);
    const existe = await prisma.producto.findUnique({ where: { id: req.params.id } });
    if (!existe) return res.status(404).json({ error: "Producto no encontrado" });

    let categoriaId: string | undefined;
    if (body.categoriaSlug) {
      const id = await idCategoria(body.categoriaSlug);
      if (!id) return res.status(400).json({ error: "La categoría no existe" });
      categoriaId = id;
    }

    const producto = await prisma.producto.update({
      where: { id: req.params.id },
      data: datosProducto(body, categoriaId),
      include: { categoria: true },
    });
    res.json(producto);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Datos inválidos", detalles: err.flatten() });
    }
    next(err);
  }
});

/** PATCH /admin/products/:id/estado — activa/desactiva (borrado lógico, RF45/CP17). */
adminRouter.patch("/products/:id/estado", async (req, res, next) => {
  try {
    const { activo } = z.object({ activo: z.boolean() }).parse(req.body);
    const existe = await prisma.producto.findUnique({ where: { id: req.params.id } });
    if (!existe) return res.status(404).json({ error: "Producto no encontrado" });

    const producto = await prisma.producto.update({
      where: { id: req.params.id },
      data: { activo },
      include: { categoria: true },
    });
    res.json(producto);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Datos inválidos", detalles: err.flatten() });
    }
    next(err);
  }
});

/**
 * DELETE /admin/products/:id — elimina. Si el producto tiene historial de
 * pedidos, hace borrado lógico (activo=false) para no perderlo (RF45, RB22);
 * si no, lo borra físicamente. Devuelve qué ocurrió.
 */
adminRouter.delete("/products/:id", async (req, res, next) => {
  try {
    const existe = await prisma.producto.findUnique({ where: { id: req.params.id } });
    if (!existe) return res.status(404).json({ error: "Producto no encontrado" });

    const enPedidos = await prisma.pedidoItem.count({ where: { productoId: req.params.id } });
    if (enPedidos > 0) {
      const producto = await prisma.producto.update({
        where: { id: req.params.id },
        data: { activo: false },
        include: { categoria: true },
      });
      return res.json({ eliminado: "logico", producto });
    }

    await prisma.$transaction([
      prisma.carritoItem.deleteMany({ where: { productoId: req.params.id } }),
      prisma.favorito.deleteMany({ where: { productoId: req.params.id } }),
      prisma.producto.delete({ where: { id: req.params.id } }),
    ]);
    res.json({ eliminado: "fisico" });
  } catch (err) {
    next(err);
  }
});

// ─── Categorías (fotos del home) ─────────────────────────────────────────────

adminRouter.get("/categories", async (_req, res, next) => {
  try {
    const cats = await prisma.categoria.findMany({ orderBy: { orden: "asc" } });
    res.json(cats);
  } catch (err) {
    next(err);
  }
});

const editarCategoriaSchema = z.object({
  nombre: z.string().trim().min(1).optional(),
  imagenUrl: z.string().url().optional().nullable(),
  overlay: z.string().optional().nullable(),
});

/** PUT /admin/categories/:slug — edita nombre/foto/overlay de la categoría (RF43). */
adminRouter.put("/categories/:slug", async (req, res, next) => {
  try {
    const body = editarCategoriaSchema.parse(req.body);
    const existe = await prisma.categoria.findUnique({ where: { slug: req.params.slug } });
    if (!existe) return res.status(404).json({ error: "Categoría no encontrada" });
    const cat = await prisma.categoria.update({ where: { slug: req.params.slug }, data: body });
    res.json(cat);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Datos inválidos", detalles: err.flatten() });
    }
    next(err);
  }
});

// ─── Configuración del sitio (hero, footer, redes, drop del inicio) ──────────

const configSchema = z.object({
  heroFlatLayUrl: z.string().url().optional().nullable(),
  heroPandaUrl: z.string().url().optional().nullable(),
  heroPandaEtiqueta: z.string().optional().nullable(),
  dropHomeProductoId: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  tiktok: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
});

adminRouter.get("/config", async (_req, res, next) => {
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

/** PUT /admin/config — actualiza el contenido editable del sitio (RF43, RF10). */
adminRouter.put("/config", async (req, res, next) => {
  try {
    const body = configSchema.parse(req.body);
    const cfg = await prisma.siteConfig.upsert({
      where: { id: "default" },
      update: body,
      create: { id: "default", ...body },
    });
    res.json(cfg);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Datos inválidos", detalles: err.flatten() });
    }
    next(err);
  }
});

// ─── Pedidos (historial + estado) ────────────────────────────────────────────

/** GET /admin/orders — historial completo de pedidos (RF48, HU16). */
adminRouter.get("/orders", async (_req, res, next) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: { items: true, usuario: { select: { nombre: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(pedidos);
  } catch (err) {
    next(err);
  }
});

/** PATCH /admin/orders/:id/estado — cambia el estado del pedido (HU16). */
adminRouter.patch("/orders/:id/estado", async (req, res, next) => {
  try {
    const { estado } = z
      .object({ estado: z.enum(["pendiente", "coordinado", "entregado", "cancelado"]) })
      .parse(req.body);
    const existe = await prisma.pedido.findUnique({ where: { id: req.params.id } });
    if (!existe) return res.status(404).json({ error: "Pedido no encontrado" });
    const pedido = await prisma.pedido.update({
      where: { id: req.params.id },
      data: { estado },
      include: { items: true, usuario: { select: { nombre: true, email: true } } },
    });
    res.json(pedido);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Datos inválidos", detalles: err.flatten() });
    }
    next(err);
  }
});

// ─── Usuarios (solo lectura, RB23) ───────────────────────────────────────────

adminRouter.get("/users", async (_req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nombre: true, email: true, avatarUrl: true, esAdmin: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
});

// ─── Tablero ─────────────────────────────────────────────────────────────────

/** GET /admin/summary — métricas del panel (productos, stock bajo, pedidos, ventas). */
adminRouter.get("/summary", async (_req, res, next) => {
  try {
    const [totalProductos, activos, agotados, stockBajo, totalPedidos, pendientes, usuarios, ventas] =
      await Promise.all([
        prisma.producto.count(),
        prisma.producto.count({ where: { activo: true } }),
        prisma.producto.count({ where: { activo: true, stock: 0 } }),
        prisma.producto.count({ where: { activo: true, stock: { gt: 0, lte: UMBRAL_STOCK_BAJO } } }),
        prisma.pedido.count(),
        prisma.pedido.count({ where: { estado: "pendiente" } }),
        prisma.usuario.count(),
        prisma.pedido.aggregate({ _sum: { total: true }, where: { estado: { not: "cancelado" } } }),
      ]);

    res.json({
      productos: { total: totalProductos, activos, inactivos: totalProductos - activos, agotados, stockBajo },
      pedidos: { total: totalPedidos, pendientes },
      usuarios,
      ventas: Number(ventas._sum.total ?? 0),
    });
  } catch (err) {
    next(err);
  }
});

// ─── Subida de fotos (Cloudinary) ────────────────────────────────────────────

/**
 * POST /admin/uploads/sign — firma para subida directa a Cloudinary (RF43).
 * 501 si no está configurado: el panel cae a pegar una URL de imagen manual.
 */
adminRouter.post("/uploads/sign", (_req, res) => {
  if (!cloudinaryConfigurado()) {
    return res.status(501).json({ error: "Cloudinary no está configurado en el servidor" });
  }
  const timestamp = Math.floor(new Date().getTime() / 1000);
  res.json(firmarSubida(timestamp));
});
