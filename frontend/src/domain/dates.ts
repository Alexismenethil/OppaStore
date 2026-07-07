/**
 * Formato de fechas del dominio, sin depender del locale del entorno de ejecución
 * (evita corrimientos por zona horaria al parsear cadenas ISO).
 */

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/**
 * Formatea una fecha ISO `YYYY-MM-DD` como `D de <mes> de YYYY`.
 * Se parsea manualmente para no depender de la zona horaria.
 * Devuelve la cadena original si no cumple el formato esperado.
 */
export function formatearFechaLarga(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const anio = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return iso;
  return `${dia} de ${MESES[mes - 1]} de ${anio}`;
}
