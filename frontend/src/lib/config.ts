/** Configuración pública del frontend (variables de entorno NEXT_PUBLIC_*). */

/** Número de WhatsApp del negocio (formato internacional). RF29. */
export const WHATSAPP_NUMERO =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? "51999999999";

/** URL base de la API del backend. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
