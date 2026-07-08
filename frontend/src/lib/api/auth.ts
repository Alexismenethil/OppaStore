import { API_URL } from "@/lib/config";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  avatarUrl: string | null;
  esAdmin: boolean;
}

export interface SesionAuth {
  token: string;
  usuario: Usuario;
}

function rutaDestinoSeguro(next?: string): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

/** Recupera el usuario autenticado a partir del token (RF38). */
export async function fetchMe(token: string): Promise<Usuario> {
  const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Sesión inválida");
  return (await res.json()).usuario as Usuario;
}

/** Login exclusivo del panel admin mediante correo + contraseña. */
export async function loginAdmin(email: string, password: string): Promise<SesionAuth> {
  const res = await fetch(`${API_URL}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let mensaje = "No se pudo iniciar sesión como administrador";
    try {
      const body = (await res.json()) as { error?: string };
      mensaje = body.error ?? mensaje;
    } catch {
      /* sin cuerpo */
    }
    throw new Error(mensaje);
  }

  return (await res.json()) as SesionAuth;
}

/** URL del flujo real de Google (redirección del navegador). */
export function urlLoginGoogle(next?: string): string {
  const url = new URL(`${API_URL}/auth/google`);
  const destino = rutaDestinoSeguro(next);
  if (destino) url.searchParams.set("next", destino);
  return url.toString();
}
