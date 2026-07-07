import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { formatearSoles, redondear2 } from "../lib/money";

export const ordersRouter = Router();

const ordenSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  distrito: z.string().min(1, "El distrito es obligatorio"),
  metodoEntrega: z.enum(["recojo", "delivery"]),
  usuarioId: z.string().uuid().optional(),
  items: z
    .array(z.object({ productoId: z.string(), cantidad: z.number().int().positive() }))
    .min(1, "El carrito no puede estar vacío"),
});

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
        distrito: datos.distrito,
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
    `Mi distrito/zona: ${datos.distrito}`,
    `Método de entrega: ${datos.metodoEntrega}`,
  ].join("\n");
}
