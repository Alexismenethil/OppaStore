import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { formatearSoles, redondear2 } from "../lib/money.js";

export const ordersRouter = Router();

const ordenSchema = z
  .object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    provincia: z.string().optional().default(""),
    distrito: z.string().optional().default(""),
    direccionEntrega: z.string().optional().default(""),
    metodoEntrega: z.enum(["recojo", "delivery"]),
    usuarioId: z.string().uuid().optional(),
    items: z
      .array(z.object({ productoId: z.string(), cantidad: z.number().int().positive() }))
      .min(1, "El carrito no puede estar vacío"),
  })
  .superRefine((datos, ctx) => {
    if (datos.metodoEntrega === "delivery") {
      if (datos.provincia.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["provincia"],
          message: "La provincia es obligatoria para delivery",
        });
      }
      if (datos.distrito.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["distrito"],
          message: "El distrito es obligatorio para delivery",
        });
      }
      if (datos.direccionEntrega.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["direccionEntrega"],
          message: "La dirección o agencia es obligatoria para delivery",
        });
      }
    }
  })
  .transform((datos) => ({
    ...datos,
    nombre: datos.nombre.trim(),
    provincia: datos.metodoEntrega === "recojo" ? "" : datos.provincia.trim(),
    distrito: datos.metodoEntrega === "recojo" ? "Recojo en tienda" : datos.distrito.trim(),
    direccionEntrega: datos.metodoEntrega === "recojo" ? "" : datos.direccionEntrega.trim(),
  }));

/**
 * POST /api/v1/orders — registra el pedido y devuelve el mensaje de WhatsApp.
 * Implementa RB01 (valida stock), RB06/RB16 (mensaje) y RB22 (registro con estado pendiente).
 * NO cobra: no hay pasarela de pagos (RB11). El pago se coordina por WhatsApp (RB12).
 */
ordersRouter.post("/", async (req, res, next) => {
  try {
    const datos = ordenSchema.parse(req.body);

    const productos = await prisma.producto.findMany({
      where: { id: { in: datos.items.map((i) => i.productoId) }, activo: true },
    });

    const lineas: {
      productoId: string;
      nombreProducto: string;
      precioUnitario: number;
      cantidad: number;
      subtotal: number;
    }[] = [];

    for (const item of datos.items) {
      const p = productos.find((x) => x.id === item.productoId);
      if (!p) return res.status(400).json({ error: `Producto ${item.productoId} no disponible` });
      if (item.cantidad > p.stock) {
        return res
          .status(400)
          .json({ error: `Stock insuficiente para "${p.nombre}" (disponible: ${p.stock})` });
      }
      lineas.push({
        productoId: p.id,
        nombreProducto: p.nombre,
        precioUnitario: Number(p.precio),
        cantidad: item.cantidad,
        subtotal: redondear2(Number(p.precio) * item.cantidad),
      });
    }

    const total = redondear2(lineas.reduce((acc, l) => acc + l.subtotal, 0));
    const mensaje = construirMensaje(lineas, total, datos);

    const pedido = await prisma.pedido.create({
      data: {
        usuarioId: datos.usuarioId,
        nombreCliente: datos.nombre,
        distrito: datos.metodoEntrega === "delivery" ? `${datos.provincia} / ${datos.distrito}` : datos.distrito,
        metodoEntrega: datos.metodoEntrega,
        total,
        mensajeWhatsapp: mensaje,
        estado: "pendiente",
        items: { create: lineas },
      },
      include: { items: true },
    });

    res.status(201).json({ pedido, mensaje });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Datos inválidos", detalles: err.flatten() });
    }
    next(err);
  }
});

function construirMensaje(
  lineas: { nombreProducto: string; precioUnitario: number; cantidad: number }[],
  total: number,
  datos: z.infer<typeof ordenSchema>,
): string {
  const items = lineas.map((l, i) => {
    const sufijo = l.cantidad > 1 ? " c/u" : "";
    return `${i + 1}. ${l.nombreProducto} - Cantidad: ${l.cantidad} - ${formatearSoles(l.precioUnitario)}${sufijo}`;
  });
  return [
    "Hola OppaStore 💚 Quiero realizar este pedido:",
    "",
    ...items,
    "",
    `Total aproximado: ${formatearSoles(total)}`,
    "",
    `Mi nombre: ${datos.nombre}`,
    ...(datos.metodoEntrega === "delivery"
      ? [
          `Provincia / ciudad: ${datos.provincia}`,
          `Distrito: ${datos.distrito}`,
          `Dirección o agencia: ${datos.direccionEntrega}`,
        ]
      : []),
    `Método de entrega: ${datos.metodoEntrega === "delivery" ? "delivery nacional" : datos.metodoEntrega}`,
  ].join("\n");
}
