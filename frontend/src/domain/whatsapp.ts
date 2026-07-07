/**
 * Generación del pedido por WhatsApp.
 *  - RB06: mensaje con TODOS los productos del carrito.
 *  - RB16: incluye nombre, distrito/zona y método de entrega.
 *  - RB18: montos en formato "S/ X.XX".
 *  - RF29: enlace wa.me con el texto prellenado.
 * No hay pasarela de pagos (RB11): el flujo termina aquí, en WhatsApp (RB12).
 */
import type { DatosCliente, ItemCarrito } from "./types";
import { formatearSoles } from "./money";
import { subtotalItem, totalCarrito } from "./cart";

const ETIQUETA_ENTREGA: Record<DatosCliente["metodoEntrega"], string> = {
  recojo: "recojo",
  delivery: "delivery",
};

/** Construye el texto del pedido para WhatsApp (RB06, RB16, RB18). */
export function construirMensaje(items: ItemCarrito[], datos: DatosCliente): string {
  const lineas = items.map((item, idx) => {
    const precio = formatearSoles(item.producto.precio);
    const sufijo = item.cantidad > 1 ? " c/u" : "";
    return `${idx + 1}. ${item.producto.nombre} - Cantidad: ${item.cantidad} - ${precio}${sufijo}`;
  });

  return [
    "Hola OppaStore 💚 Quiero realizar este pedido:",
    "",
    ...lineas,
    "",
    `Total aproximado: ${formatearSoles(totalCarrito(items))}`,
    "",
    `Mi nombre: ${datos.nombre}`,
    `Mi distrito/zona: ${datos.distrito}`,
    `Método de entrega: ${ETIQUETA_ENTREGA[datos.metodoEntrega]}`,
  ].join("\n");
}

/** Normaliza un número de WhatsApp a solo dígitos (formato internacional). */
export function normalizarNumero(numero: string): string {
  return numero.replace(/\D/g, "");
}

/** Enlace wa.me con el mensaje prellenado (RF29). */
export function enlaceWhatsapp(numero: string, mensaje: string): string {
  return `https://wa.me/${normalizarNumero(numero)}?text=${encodeURIComponent(mensaje)}`;
}

/** Detalle de líneas listo para persistir el pedido (snapshot de precio, RB22). */
export function detallePedido(items: ItemCarrito[]) {
  return items.map((item) => ({
    productoId: item.producto.id,
    nombreProducto: item.producto.nombre,
    precioUnitario: item.producto.precio,
    cantidad: item.cantidad,
    subtotal: subtotalItem(item),
  }));
}
