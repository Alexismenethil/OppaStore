import { API_URL } from "@/lib/config";

/** Configuración pública del sitio (hero, footer/redes, drop del inicio). Sprint 4. */
export interface SiteConfig {
  heroFlatLayUrl: string | null;
  heroPandaUrl: string | null;
  heroPandaEtiqueta: string | null;
  dropHomeProductoId: string | null;
  whatsapp: string | null;
  email: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  direccion: string | null;
}

/** Categoría con su foto y overlay para el home y el catálogo. */
export interface CategoriaMedia {
  slug: string;
  nombre: string;
  imagenUrl: string | null;
  overlay: string | null;
  orden: number;
}

/** GET /config — contenido editable del sitio. */
export async function fetchConfig(): Promise<SiteConfig> {
  const res = await fetch(`${API_URL}/config`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error al obtener la configuración (${res.status})`);
  return res.json();
}

/** GET /categories — categorías con foto. */
export async function fetchCategorias(): Promise<CategoriaMedia[]> {
  const res = await fetch(`${API_URL}/categories`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error al obtener las categorías (${res.status})`);
  return res.json();
}
