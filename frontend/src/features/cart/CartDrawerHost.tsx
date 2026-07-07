"use client";

import { CartDrawer } from "@/components/CartDrawer";
import { useCart } from "./CartContext";
import { useToast } from "@/components/ui/Toast";
import { construirMensaje, enlaceWhatsapp } from "@/domain/whatsapp";
import { WHATSAPP_NUMERO } from "@/lib/config";
import { validarCantidad } from "@/domain/cart";
import type { ItemCarrito } from "@/domain/types";

/**
 * Conecta el CartDrawer con el estado global y WhatsApp.
 * Nota Sprint 2: aquí se insertará el formulario de datos del cliente y el
 * registro del pedido (POST /orders, RB22) antes de abrir wa.me.
 */
export function CartDrawerHost() {
  const { items, abierto, cerrar, cambiarCantidad, eliminar } = useCart();
  const { mostrar } = useToast();

  const incrementar = (item: ItemCarrito) => {
    const v = validarCantidad(item.producto, item.cantidad + 1);
    if (!v.ok) {
      mostrar("aviso", v.motivo ?? "No hay más stock disponible");
      return;
    }
    cambiarCantidad(item.producto.id, item.cantidad + 1);
  };

  const decrementar = (item: ItemCarrito) => {
    cambiarCantidad(item.producto.id, item.cantidad - 1); // el dominio no baja de 1 (RB07)
  };

  const quitar = (item: ItemCarrito) => {
    eliminar(item.producto.id);
    mostrar("exito", `"${item.producto.nombre}" eliminado del carrito`);
  };

  const enviar = () => {
    if (items.length === 0) return;
    const mensaje = construirMensaje(items); // RB06/RB16 — datos del cliente se completan en el chat
    window.open(enlaceWhatsapp(WHATSAPP_NUMERO, mensaje), "_blank", "noopener");
  };

  return (
    <CartDrawer
      abierto={abierto}
      items={items}
      onCerrar={cerrar}
      onIncrementar={incrementar}
      onDecrementar={decrementar}
      onEliminar={quitar}
      onEnviar={enviar}
    />
  );
}
