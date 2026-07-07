import type { Producto } from "@/domain/types";

export function producto(overrides: Partial<Producto> = {}): Producto {
  return {
    id: "x1",
    slug: "producto-x",
    nombre: "Producto X",
    descripcion: "desc",
    precio: 10,
    stock: 10,
    categoria: "skincare",
    tipo: "general",
    activo: true,
    esPreventa: false,
    ...overrides,
  };
}
