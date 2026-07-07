/**
 * Estado del producto DERIVADO del stock + banderas (RB19).
 * No se persiste como texto; se calcula. Precedencia:
 * Preventa (activa) > Agotado (stock 0) > Pocas unidades (1..5) > Disponible (>5).
 *   - RB02: stock 0 -> "Agotado", no comprable.
 *   - RB09: 1..5 -> "Pocas unidades".
 *   - RB03: preventa muestra etiqueta "Preventa".
 */
import type { EstadoProducto, Producto } from "./types";

/** Umbral de "pocas unidades" (RB09). */
export const UMBRAL_POCAS_UNIDADES = 5;

export function estadoProducto(p: Producto): EstadoProducto {
  if (p.esPreventa) return "preventa";
  if (p.stock <= 0) return "agotado";
  if (p.stock <= UMBRAL_POCAS_UNIDADES) return "pocas_unidades";
  return "disponible";
}

const ETIQUETAS: Record<EstadoProducto, string> = {
  disponible: "Disponible",
  pocas_unidades: "Pocas unidades",
  agotado: "Agotado",
  preventa: "Preventa",
};

export function etiquetaEstado(p: Producto): string {
  return ETIQUETAS[estadoProducto(p)];
}

/**
 * ¿Se puede agregar el producto al carrito? (RB01, RB02).
 * Un producto agotado o inactivo no es comprable. Una preventa con stock sí lo es (RF33).
 */
export function esComprable(p: Producto): boolean {
  return p.activo && p.stock > 0;
}

/** Cantidad máxima que se puede llevar de un producto (RB01). */
export function maximoAgregable(p: Producto): number {
  return Math.max(0, p.stock);
}
