/** Redondeo y formato de soles del lado servidor (espejo de RB18). */
export function redondear2(monto: number): number {
  return Math.round((monto + Number.EPSILON) * 100) / 100;
}

export function formatearSoles(monto: number): string {
  return `S/ ${redondear2(monto).toFixed(2)}`;
}
