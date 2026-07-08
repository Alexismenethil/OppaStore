import type { Producto, TipoProducto } from "@/domain/types";
import { API_URL } from "@/lib/config";

/** Forma de un producto tal como lo devuelve la API (Prisma → JSON). */
interface ApiProducto {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: string; // Decimal serializado
  stock: number;
  tipo: string;
  activo: boolean;
  esPreventa: boolean;
  fechaEstimadaLlegada: string | null;
  fechaVencimiento: string | null;
  infoAdicional: Producto["infoAdicional"] | null;
  imagenUrl: string | null;
  imagenes?: string[] | null;
  destacado: boolean;
  categoria?: { slug: string; nombre: string };
}

/** Mapea el producto de la API al tipo del dominio (precio numérico, categoría por slug). */
export function mapProducto(api: ApiProducto): Producto {
  return {
    id: api.id,
    slug: api.slug,
    nombre: api.nombre,
    descripcion: api.descripcion,
    precio: Number(api.precio),
    stock: api.stock,
    categoria: api.categoria?.slug ?? "",
    tipo: api.tipo as TipoProducto,
    activo: api.activo,
    esPreventa: api.esPreventa,
    fechaEstimadaLlegada: api.fechaEstimadaLlegada ?? undefined,
    fechaVencimiento: api.fechaVencimiento ?? undefined,
    infoAdicional: api.infoAdicional ?? undefined,
    imagenUrl: api.imagenUrl ?? undefined,
    imagenes: api.imagenes?.filter(Boolean) ?? undefined,
    destacado: api.destacado,
  };
}

export interface ParamsCatalogo {
  categoria?: string;
  q?: string;
}

/** GET /products — lista de productos activos (RF11). */
export async function fetchProductos(params: ParamsCatalogo = {}): Promise<Producto[]> {
  const qs = new URLSearchParams();
  if (params.categoria) qs.set("categoria", params.categoria);
  if (params.q) qs.set("q", params.q);
  const query = qs.toString();

  const res = await fetch(`${API_URL}/products${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Error al obtener productos (${res.status})`);
  const data: ApiProducto[] = await res.json();
  return data.map(mapProducto);
}

/** GET /products/destacados — "los más pedidos" calculados por ventas (RF48). */
export async function fetchDestacados(limit = 4): Promise<Producto[]> {
  const res = await fetch(`${API_URL}/products/destacados?limit=${limit}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error al obtener destacados (${res.status})`);
  const data: ApiProducto[] = await res.json();
  return data.map(mapProducto);
}

/** GET /products/:slug — detalle de producto (RF18). */
export async function fetchProducto(slug: string): Promise<Producto | null> {
  const res = await fetch(`${API_URL}/products/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Error al obtener el producto (${res.status})`);
  return mapProducto(await res.json());
}
