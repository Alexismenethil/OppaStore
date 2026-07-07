/**
 * Validación de los datos del cliente para el checkout (RF27, RB16).
 * El sistema NO cobra (RB11): estos datos solo acompañan al pedido registrado
 * (RB22) y al mensaje de WhatsApp donde se coordina el pago y la entrega.
 */
import type { DatosCliente, MetodoEntrega } from "./types";
import { esDistritoValido, esProvinciaValida } from "@/data/ubicaciones.envio";

export type ErroresCliente = Partial<Record<keyof DatosCliente, string>>;

export interface ResultadoDatosCliente {
  ok: boolean;
  errores: ErroresCliente;
}

export const METODOS_ENTREGA: MetodoEntrega[] = ["recojo", "delivery"];

const LONGITUD_MINIMA = 2;

/** Valida nombre, método de entrega y destino nacional solo cuando hay delivery (RF27, RB16). */
export function validarDatosCliente(datos: Partial<DatosCliente>): ResultadoDatosCliente {
  const errores: ErroresCliente = {};
  const metodoValido = Boolean(datos.metodoEntrega && METODOS_ENTREGA.includes(datos.metodoEntrega));

  if ((datos.nombre?.trim().length ?? 0) < LONGITUD_MINIMA) {
    errores.nombre = "Ingresa tu nombre (mínimo 2 caracteres).";
  }

  if (!metodoValido) {
    errores.metodoEntrega = "Elige un método de entrega.";
  }

  if (datos.metodoEntrega === "delivery") {
    if (!esProvinciaValida(datos.provincia)) {
      errores.provincia = "Selecciona una provincia de la lista.";
    }

    if (!esDistritoValido(datos.provincia, datos.distrito)) {
      errores.distrito = "Selecciona un distrito de la lista.";
    }

    if ((datos.direccionEntrega?.trim().length ?? 0) < LONGITUD_MINIMA) {
      errores.direccionEntrega = "Indica una dirección o agencia de transporte.";
    }
  }

  return { ok: Object.keys(errores).length === 0, errores };
}

/** Recorta los espacios de unos datos ya válidos antes de enviarlos al backend. */
export function normalizarDatosCliente(datos: DatosCliente): DatosCliente {
  if (datos.metodoEntrega === "recojo") {
    return {
      nombre: datos.nombre.trim(),
      provincia: "",
      distrito: "Recojo en tienda",
      direccionEntrega: "",
      metodoEntrega: datos.metodoEntrega,
    };
  }

  return {
    nombre: datos.nombre.trim(),
    provincia: datos.provincia?.trim() ?? "",
    distrito: datos.distrito.trim(),
    direccionEntrega: datos.direccionEntrega?.trim() ?? "",
    metodoEntrega: datos.metodoEntrega,
  };
}
