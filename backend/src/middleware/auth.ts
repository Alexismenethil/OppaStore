import type { Request, Response, NextFunction } from "express";
import { verificarToken, type TokenPayload } from "../lib/jwt";

export interface ReqConUsuario extends Request {
  usuario?: TokenPayload;
}

function leerToken(req: Request): string | null {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

/** Exige un JWT válido; responde 401 si falta o es inválido (RF38). */
export function autenticar(req: ReqConUsuario, res: Response, next: NextFunction) {
  const token = leerToken(req);
  const payload = token ? verificarToken(token) : null;
  if (!payload) return res.status(401).json({ error: "Sesión requerida" });
  req.usuario = payload;
  next();
}

/**
 * Exige un usuario administrador autenticado en el panel (RF42/CP21 — Sprint 4).
 * 401 si no hay sesión; 403 si la sesión no es admin.
 */
export function soloAdmin(req: ReqConUsuario, res: Response, next: NextFunction) {
  const token = leerToken(req);
  const payload = token ? verificarToken(token) : null;
  if (!payload) return res.status(401).json({ error: "Sesión requerida" });
  if (!payload.esAdmin) return res.status(403).json({ error: "Acceso restringido a administradores" });
  req.usuario = payload;
  next();
}
