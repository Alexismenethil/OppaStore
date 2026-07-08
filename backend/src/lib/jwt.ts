import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "oppastore-dev-secret-cambiar-en-produccion";

export interface TokenPayload {
  sub: string; // id del usuario
  email: string;
  nombre: string;
  esAdmin: boolean;
}

/** Firma un JWT con 30 días de vigencia (RF38, sesión opcional). */
export function firmarToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

/** Verifica un JWT; devuelve el payload o null si es inválido/expiró. */
export function verificarToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
