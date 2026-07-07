import { API_URL } from "@/lib/config";
import type { DatosCliente, ItemCarrito } from "@/domain/types";

export interface RespuestaPedido {
  pedido: { id: string; estado: string };
  /** Mensaje de WhatsApp generado por el servidor (fuente autoritativa). */
  mensaje: string;
}

/**
 * POST /orders — registra el pedido en la base de datos ANTES de abrir WhatsApp
 * (RF28, RB22, CP20) y devuelve el mensaje de WhatsApp generado por el servidor.
 * No cobra: no hay pasarela de pagos (RB11); el pago se coordina por WhatsApp (RB12).
 */
export async function crearPedido(
  datos: DatosCliente,
  items: ItemCarrito[],
  usuarioId?: string,
): Promise<RespuestaPedido> {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: datos.nombre,
      provincia: datos.provincia,
      distrito: datos.distrito,
      direccionEntrega: datos.direccionEntrega,
      metodoEntrega: datos.metodoEntrega,
      usuarioId,
      items: items.map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad })),
    }),
  });

  if (!res.ok) {
    let detalle = `Error al registrar el pedido (${res.status})`;
    try {
      const cuerpo = await res.json();
      if (cuerpo?.error) detalle = cuerpo.error;
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new Error(detalle);
  }

  return res.json();
}
