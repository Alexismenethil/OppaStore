/**
 * Lógica pura de favoritos. Implementa RB08: sin duplicados.
 * Se representa como una lista de IDs de producto.
 */

export function esFavorito(favoritos: string[], productoId: string): boolean {
  return favoritos.includes(productoId);
}

/** Agrega un favorito evitando duplicados (RB08). */
export function agregarFavorito(favoritos: string[], productoId: string): string[] {
  return esFavorito(favoritos, productoId) ? favoritos : [...favoritos, productoId];
}

export function quitarFavorito(favoritos: string[], productoId: string): string[] {
  return favoritos.filter((id) => id !== productoId);
}

/** Alterna un producto en favoritos (agrega si no está, quita si está). */
export function alternarFavorito(favoritos: string[], productoId: string): string[] {
  return esFavorito(favoritos, productoId)
    ? quitarFavorito(favoritos, productoId)
    : agregarFavorito(favoritos, productoId);
}
