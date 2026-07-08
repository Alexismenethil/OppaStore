import { API_URL } from "@/lib/config";

export interface ItemGuardado {
  productoId: string;
  cantidad: number;
}

function cabeceras(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

/** Carrito guardado del usuario (RF39). */
export async function getCartRemoto(token: string): Promise<ItemGuardado[]> {
  const res = await fetch(`${API_URL}/me/cart`, { headers: cabeceras(token), cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo leer el carrito guardado");
  return (await res.json()).items as ItemGuardado[];
}

/** Reemplaza el carrito guardado (RF39). */
export async function putCartRemoto(token: string, items: ItemGuardado[]): Promise<void> {
  const res = await fetch(`${API_URL}/me/cart`, {
    method: "PUT",
    headers: cabeceras(token),
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error("No se pudo guardar el carrito");
}

/** Favoritos guardados del usuario (RF37). */
export async function getFavoritesRemoto(token: string): Promise<string[]> {
  const res = await fetch(`${API_URL}/me/favorites`, { headers: cabeceras(token), cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo leer los favoritos guardados");
  return (await res.json()).ids as string[];
}

/** Reemplaza los favoritos guardados (RF37). */
export async function putFavoritesRemoto(token: string, ids: string[]): Promise<void> {
  const res = await fetch(`${API_URL}/me/favorites`, {
    method: "PUT",
    headers: cabeceras(token),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("No se pudo guardar los favoritos");
}
