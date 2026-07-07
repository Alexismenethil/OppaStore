/**
 * Lógica pura del catálogo (filtro por categoría y búsqueda por nombre).
 *  - RB10: solo productos activos en el catálogo público.
 *  - RF12: filtro por categoría.
 *  - RF13: búsqueda por nombre (parcial, sin distinción de mayúsculas).
 */
import type { Producto } from "./types";

export const CATEGORIA_TODOS = "todos";

export interface FiltroCatalogo {
  categoria?: string;
  q?: string;
}

/** Normaliza texto para comparaciones (minúsculas y sin espacios sobrantes). */
function normalizar(texto: string): string {
  return texto.toLowerCase().trim();
}

/**
 * Devuelve los productos activos que cumplen el filtro.
 * Un `categoria` vacío o "todos" no filtra por categoría; un `q` vacío no filtra por nombre.
 */
export function filtrarProductos(productos: Producto[], filtro: FiltroCatalogo = {}): Producto[] {
  const categoria = filtro.categoria && filtro.categoria !== CATEGORIA_TODOS ? filtro.categoria : null;
  const q = filtro.q ? normalizar(filtro.q) : null;

  return productos.filter((p) => {
    if (!p.activo) return false; // RB10
    if (categoria && p.categoria !== categoria) return false; // RF12
    if (q && !normalizar(p.nombre).includes(q)) return false; // RF13
    return true;
  });
}
