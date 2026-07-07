/**
 * Tipos del dominio de OppaStore.
 * Ver especificaciones/02-modelo-de-datos-der.md
 */

export type TipoProducto =
  | "skincare"
  | "snack"
  | "peluche"
  | "accesorio"
  | "coleccion"
  | "drop"
  | "general";

export type EstadoProducto = "disponible" | "pocas_unidades" | "agotado" | "preventa";

export type MetodoEntrega = "recojo" | "delivery";

/** Información adicional según el tipo de producto (RF19, RB13, RB14). */
export interface InfoAdicional {
  tipoPiel?: string;
  modoUso?: string;
  advertencia?: string;
  alergenos?: string;
}

export interface Producto {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  /** Precio en soles (PEN). */
  precio: number;
  stock: number;
  categoria: string;
  tipo: TipoProducto;
  /** Un producto inactivo no se muestra en el catálogo público (RB10). */
  activo: boolean;
  esPreventa: boolean;
  /** ISO date. Solo para preventas/drops (RB03). */
  fechaEstimadaLlegada?: string;
  /** ISO date. Skincare/snacks (RB13, RB14). */
  fechaVencimiento?: string;
  infoAdicional?: InfoAdicional;
  imagenUrl?: string;
  destacado?: boolean;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export interface DatosCliente {
  nombre: string;
  distrito: string;
  metodoEntrega: MetodoEntrega;
}
