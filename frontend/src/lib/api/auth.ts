import { API_URL } from "@/lib/config";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  avatarUrl: string | null;
  esAdmin: boolean;
}

/** Recupera el usuario autenticado a partir del token (RF38). */
export async function fetchMe(token: string): Promise<Usuario> {
  const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Sesión inválida");
  return (await res.json()).usuario as Usuario;
}

/** URL del flujo real de Google (redirección del navegador). */
export function urlLoginGoogle(): string {
  return `${API_URL}/auth/google`;
}
