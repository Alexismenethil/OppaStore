"use client";

import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutForm } from "@/features/checkout/CheckoutForm";
import { useCart } from "./CartContext";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { construirMensaje, enlaceWhatsapp } from "@/domain/whatsapp";
import { WHATSAPP_NUMERO } from "@/lib/config";
import { validarCantidad } from "@/domain/cart";
import { useSiteConfig } from "@/features/config/ConfigContext";
import {
  validarDatosCliente,
  normalizarDatosCliente,
  type ErroresCliente,
} from "@/domain/checkout";
import { crearPedido } from "@/lib/api/orders";
import type { DatosCliente, ItemCarrito } from "@/domain/types";

/**
 * Conecta el CartDrawer con el estado global, el registro del pedido y WhatsApp.
 * Flujo (RF27–RF29): carrito → datos del cliente → POST /orders (RB22) → wa.me (RB06).
 */
function resolverNumeroWhatsapp(configurado?: string | null): string | null {
  const numero = configurado?.trim() || WHATSAPP_NUMERO;
  return numero || null;
}

function reservarVentanaWhatsapp(): Window | null {
  return window.open("about:blank", "_blank");
}

function redirigirAWhatsapp(ventana: Window | null, url: string) {
  if (ventana && !ventana.closed) {
    try {
      ventana.location.replace(url);
      ventana.focus?.();
      return;
    } catch {
      // Si el navegador bloquea o invalida la ventana reservada, caemos al tab actual.
    }
  }
  window.location.assign(url);
}

export function CartDrawerHost() {
  const { items, abierto, cerrar, cambiarCantidad, eliminar, vaciar, total } = useCart();
  const { usuario } = useAuth();
  const { mostrar } = useToast();
  const { config } = useSiteConfig();

  const [paso, setPaso] = useState<"carrito" | "datos">("carrito");
  const [datos, setDatos] = useState<Partial<DatosCliente>>({ metodoEntrega: "recojo" });
  const [errores, setErrores] = useState<ErroresCliente>({});
  const [enviando, setEnviando] = useState(false);

  // Al cerrar el drawer, vuelve al primer paso y limpia el estado de envío.
  useEffect(() => {
    if (!abierto) {
      setPaso("carrito");
      setErrores({});
      setEnviando(false);
    }
  }, [abierto]);

  useEffect(() => {
    if (!abierto || paso !== "datos" || !usuario?.nombre || usuario.esAdmin) return;
    setDatos((prev) => (prev.nombre?.trim() ? prev : { ...prev, nombre: usuario.nombre }));
    setErrores((prev) => ({ ...prev, nombre: undefined }));
  }, [abierto, paso, usuario?.esAdmin, usuario?.nombre]);

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

  const cambiarDato = <K extends keyof DatosCliente>(campo: K, valor: DatosCliente[K]) => {
    setDatos((prev) => {
      const siguiente = { ...prev, [campo]: valor };
      if (campo === "metodoEntrega" && valor === "recojo") {
        siguiente.provincia = "";
        siguiente.distrito = "";
        siguiente.direccionEntrega = "";
      }
      if (campo === "provincia") siguiente.distrito = "";
      return siguiente;
    });
    setErrores((prev) => ({
      ...prev,
      [campo]: undefined,
      ...(campo === "metodoEntrega" && valor === "recojo"
        ? { provincia: undefined, distrito: undefined, direccionEntrega: undefined }
        : {}),
      ...(campo === "provincia" ? { distrito: undefined } : {}),
    }));
  };

  const finalizarConWhatsapp = (numero: string, mensaje: string, ventana: Window | null) => {
    vaciar();
    cerrar();
    redirigirAWhatsapp(ventana, enlaceWhatsapp(numero, mensaje));
  };

  const confirmar = async () => {
    if (items.length === 0 || enviando) return;
    const validacion = validarDatosCliente(datos);
    if (!validacion.ok) {
      setErrores(validacion.errores);
      return;
    }
    const limpios = normalizarDatosCliente(datos as DatosCliente);
    const numeroWhatsapp = resolverNumeroWhatsapp(config.whatsapp);
    if (!numeroWhatsapp) {
      mostrar("aviso", "Configura el WhatsApp del negocio para poder enviar pedidos");
      return;
    }

    const ventanaWhatsapp = reservarVentanaWhatsapp();
    setEnviando(true);
    try {
      // RF28/RB22/CP20: registra el pedido en la BD antes de abrir WhatsApp.
      const { mensaje } = await crearPedido(limpios, items);
      finalizarConWhatsapp(numeroWhatsapp, mensaje, ventanaWhatsapp);
      mostrar("exito", "¡Pedido registrado! Continúa la coordinación en WhatsApp 💚");
    } catch {
      // Resiliencia (RNF09): si el backend no responde, no perdemos la venta;
      // abrimos WhatsApp con el mensaje generado localmente y avisamos.
      finalizarConWhatsapp(numeroWhatsapp, construirMensaje(items, limpios), ventanaWhatsapp);
      mostrar("aviso", "No pudimos registrar el pedido, pero tu WhatsApp está listo 💬");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <CartDrawer
      abierto={abierto}
      items={items}
      paso={paso}
      onCerrar={cerrar}
      onIncrementar={incrementar}
      onDecrementar={decrementar}
      onEliminar={quitar}
      onContinuar={() => setPaso("datos")}
      onVolver={() => setPaso("carrito")}
      checkout={
        <CheckoutForm
          datos={datos}
          errores={errores}
          enviando={enviando}
          total={total}
          onCambiar={cambiarDato}
          onEnviar={confirmar}
        />
      }
    />
  );
}
