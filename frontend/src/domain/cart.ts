/**
 * Lógica pura del carrito. Implementa:
 *  - RB01: no agregar más que el stock.
 *  - RB04/RB05: total calculado automáticamente y al instante.
 *  - RB07: cantidad nunca menor a 1.
 *  - RB02: producto agotado/inactivo no se agrega.
 * Todas las funciones son inmutables (devuelven un carrito nuevo).
 */
import type { ItemCarrito, Producto } from "./types";
import { esComprable } from "./productStatus";
import { redondear2 } from "./money";

/** Restringe un valor al rango [min, max]. */
function limitar(valor: number, min: number, max: number): number {
  return Math.min(Math.max(valor, min), max);
}

export interface ResultadoValidacion {
  ok: boolean;
  motivo?: string;
}

/** Cantidad actual de un producto en el carrito. */
export function cantidadEnCarrito(items: ItemCarrito[], productoId: string): number {
  return items.find((i) => i.producto.id === productoId)?.cantidad ?? 0;
}

/** Número total de unidades (para el contador del ícono de carrito, RF04). */
export function contarItems(items: ItemCarrito[]): number {
  return items.reduce((acc, i) => acc + i.cantidad, 0);
}

/**
 * Valida si se puede llevar `cantidadDeseada` unidades de un producto (RB01, RB02, RB07).
 * `cantidadDeseada` es la cantidad TOTAL resultante en el carrito.
 */
export function validarCantidad(producto: Producto, cantidadDeseada: number): ResultadoValidacion {
  if (!producto.activo) return { ok: false, motivo: "Producto no disponible" };
  if (producto.stock <= 0) return { ok: false, motivo: "Producto agotado" };
  if (cantidadDeseada < 1) return { ok: false, motivo: "La cantidad mínima es 1" };
  if (cantidadDeseada > producto.stock) {
    return { ok: false, motivo: `Solo hay ${producto.stock} unidad(es) disponible(s)` };
  }
  return { ok: true };
}

/**
 * Agrega `cantidad` unidades de un producto al carrito (RB01, RB07).
 * Si ya existe, suma sin exceder el stock. Si no es comprable, deja el carrito igual.
 */
export function agregarAlCarrito(
  items: ItemCarrito[],
  producto: Producto,
  cantidad = 1,
): ItemCarrito[] {
  if (!esComprable(producto)) return items;
  const actual = cantidadEnCarrito(items, producto.id);
  const nueva = limitar(actual + cantidad, 1, producto.stock);
  if (actual === 0) {
    return [...items, { producto, cantidad: nueva }];
  }
  return items.map((i) => (i.producto.id === producto.id ? { ...i, cantidad: nueva } : i));
}

/**
 * Fija la cantidad de un ítem (RB01, RB05, RB07). Se restringe a [1, stock].
 * Para eliminar, usar `eliminarItem`.
 */
export function actualizarCantidad(
  items: ItemCarrito[],
  productoId: string,
  cantidad: number,
): ItemCarrito[] {
  return items.map((i) => {
    if (i.producto.id !== productoId) return i;
    return { ...i, cantidad: limitar(cantidad, 1, i.producto.stock) };
  });
}

/** Elimina un ítem del carrito. */
export function eliminarItem(items: ItemCarrito[], productoId: string): ItemCarrito[] {
  return items.filter((i) => i.producto.id !== productoId);
}

/** Subtotal de una línea = precio × cantidad (RB18). */
export function subtotalItem(item: ItemCarrito): number {
  return redondear2(item.producto.precio * item.cantidad);
}

/** Total del carrito (RB04). */
export function totalCarrito(items: ItemCarrito[]): number {
  return redondear2(items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0));
}

/**
 * Fusiona un carrito de invitado con el carrito guardado al iniciar sesión (RB21).
 * Suma cantidades por producto sin exceder el stock.
 */
export function fusionarCarritos(
  invitado: ItemCarrito[],
  guardado: ItemCarrito[],
): ItemCarrito[] {
  const mapa = new Map<string, ItemCarrito>();
  for (const item of [...guardado, ...invitado]) {
    const previo = mapa.get(item.producto.id);
    const suma = (previo?.cantidad ?? 0) + item.cantidad;
    mapa.set(item.producto.id, {
      producto: item.producto,
      cantidad: limitar(suma, 1, item.producto.stock),
    });
  }
  return [...mapa.values()];
}
