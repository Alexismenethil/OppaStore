/**
 * Formato y redondeo de dinero en soles (PEN).
 * Implementa RB18: precios y totales siempre como "S/ X.XX" (2 decimales).
 */

/** Redondea a 2 decimales (céntimos) evitando errores de coma flotante. */
export function redondear2(monto: number): number {
  return Math.round((monto + Number.EPSILON) * 100) / 100;
}

/** Formatea un monto como "S/ 173.00" (RB18). */
export function formatearSoles(monto: number): string {
  return `S/ ${redondear2(monto).toFixed(2)}`;
}
