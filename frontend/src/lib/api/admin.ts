import { API_URL } from "@/lib/config";
import type { SiteConfig } from "@/lib/api/config";
import type { InfoAdicional } from "@/domain/types";

const CLAVE_TOKEN = "oppastore.token.v1";

/** Error con código HTTP para distinguir 401/403/501 en la UI del panel. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function token(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CLAVE_TOKEN);
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/admin${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token() ?? ""}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const j = await res.json();
      msg = j.error ?? msg;
    } catch {
      /* sin cuerpo */
    }
    throw new ApiError(res.status, msg);
  }
  return res.json();
}

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface AdminCategoria {
  id: string;
  slug: string;
  nombre: string;
  imagenUrl: string | null;
  overlay: string | null;
  orden: number;
}

export interface AdminProducto {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: string;
  stock: number;
  tipo: string;
  activo: boolean;
  esPreventa: boolean;
  destacado: boolean;
  fechaEstimadaLlegada: string | null;
  fechaVencimiento: string | null;
  infoAdicional: InfoAdicional | null;
  imagenUrl: string | null;
  imagenes: string[] | null;
  categoriaId: string;
  categoria?: { slug: string; nombre: string };
}

export interface DatosProducto {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaSlug: string;
  tipo: string;
  imagenUrl?: string | null;
  imagenes?: string[];
  activo?: boolean;
  destacado?: boolean;
  esPreventa?: boolean;
  fechaEstimadaLlegada?: string | null;
  fechaVencimiento?: string | null;
  infoAdicional?: InfoAdicional | null;
}

export interface AdminPedidoItem {
  id: string;
  nombreProducto: string;
  precioUnitario: string;
  cantidad: number;
  subtotal: string;
}

export type EstadoPedido = "pendiente" | "coordinado" | "entregado" | "cancelado";

export interface AdminPedido {
  id: string;
  nombreCliente: string;
  distrito: string;
  metodoEntrega: "recojo" | "delivery";
  total: string;
  estado: EstadoPedido;
  mensajeWhatsapp: string;
  createdAt: string;
  items: AdminPedidoItem[];
  usuario: { nombre: string; email: string } | null;
}

export interface AdminUsuario {
  id: string;
  nombre: string;
  email: string;
  avatarUrl: string | null;
  esAdmin: boolean;
  createdAt: string;
}

export interface AdminSummary {
  productos: { total: number; activos: number; inactivos: number; agotados: number; stockBajo: number };
  pedidos: { total: number; pendientes: number };
  usuarios: number;
  ventas: number;
}

export interface FirmaSubida {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

// ── Cliente ──────────────────────────────────────────────────────────────────

export const adminApi = {
  // Productos
  productos: () => req<AdminProducto[]>("/products"),
  crearProducto: (data: DatosProducto) =>
    req<AdminProducto>("/products", { method: "POST", body: JSON.stringify(data) }),
  editarProducto: (id: string, data: Partial<DatosProducto>) =>
    req<AdminProducto>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  cambiarEstadoProducto: (id: string, activo: boolean) =>
    req<AdminProducto>(`/products/${id}/estado`, { method: "PATCH", body: JSON.stringify({ activo }) }),
  borrarProducto: (id: string) =>
    req<{ eliminado: "logico" | "fisico" }>(`/products/${id}`, { method: "DELETE" }),

  // Categorías
  categorias: () => req<AdminCategoria[]>("/categories"),
  editarCategoria: (slug: string, data: Partial<Pick<AdminCategoria, "nombre" | "imagenUrl" | "overlay">>) =>
    req<AdminCategoria>(`/categories/${slug}`, { method: "PUT", body: JSON.stringify(data) }),

  // Configuración del sitio
  config: () => req<SiteConfig>("/config"),
  editarConfig: (data: Partial<SiteConfig>) =>
    req<SiteConfig>("/config", { method: "PUT", body: JSON.stringify(data) }),

  // Pedidos
  pedidos: () => req<AdminPedido[]>("/orders"),
  cambiarEstadoPedido: (id: string, estado: EstadoPedido) =>
    req<AdminPedido>(`/orders/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) }),

  // Usuarios y tablero
  usuarios: () => req<AdminUsuario[]>("/users"),
  summary: () => req<AdminSummary>("/summary"),

  // Subida de fotos (Cloudinary)
  firmarSubida: () => req<FirmaSubida>("/uploads/sign", { method: "POST" }),
};
