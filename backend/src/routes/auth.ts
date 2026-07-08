import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { firmarToken } from "../lib/jwt.js";
import { upsertUsuario } from "../lib/usuarios.js";
import { autenticar, type ReqConUsuario } from "../middleware/auth.js";
import { adminLoginConfigurado, credencialesAdminValidas, datosAdminConfigurado } from "../lib/adminAuth.js";

export const authRouter = Router();

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

function googleConfigurado(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

const adminLoginSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export function rutaFrontendSeguro(raw: unknown, fallback = "/cuenta"): string {
  if (typeof raw !== "string") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

export function urlFrontend(destino: string, extras?: { error?: string; token?: string }): string {
  const url = new URL(destino, FRONTEND_URL);
  if (extras?.error) url.searchParams.set("error", extras.error);
  if (extras?.token) url.hash = new URLSearchParams({ token: extras.token }).toString();
  return url.toString();
}

/** GET /auth/google — redirige al consentimiento de Google (RF38). */
authRouter.get("/google", (req, res) => {
  if (!googleConfigurado()) {
    return res.status(501).json({ error: "Google OAuth no está configurado en el servidor" });
  }
  const next = rutaFrontendSeguro(req.query.next, "/cuenta");
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL ?? `${FRONTEND_URL}/api/auth/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state: next,
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

/** GET /auth/google/callback — intercambia el código, crea el usuario y vuelve al front. */
authRouter.get("/google/callback", async (req, res, next) => {
  if (!googleConfigurado()) {
    return res.status(501).json({ error: "Google OAuth no está configurado en el servidor" });
  }
  const destino = rutaFrontendSeguro(req.query.state, "/cuenta");
  const code = typeof req.query.code === "string" ? req.query.code : null;
  if (!code) return res.redirect(urlFrontend(destino, { error: "sin_codigo" }));
  try {
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL ?? `${FRONTEND_URL}/api/auth/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return res.redirect(urlFrontend(destino, { error: "token" }));
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) return res.redirect(urlFrontend(destino, { error: "token" }));

    const perfilRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const perfil = (await perfilRes.json()) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
    };

    const usuario = await upsertUsuario({
      googleId: `google:${perfil.sub}`,
      email: perfil.email,
      nombre: perfil.name ?? perfil.email.split("@")[0],
      avatarUrl: perfil.picture,
      esAdmin: false,
    });
    const token = firmarToken({
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      esAdmin: usuario.esAdmin,
    });
    res.redirect(urlFrontend(destino, { token }));
  } catch (err) {
    next(err);
  }
});

/** POST /auth/admin/login — acceso exclusivo del panel admin por correo + contraseña. */
authRouter.post("/admin/login", async (req, res, next) => {
  if (!adminLoginConfigurado()) {
    return res.status(501).json({ error: "El login admin no está configurado en el servidor" });
  }

  try {
    const { email, password } = adminLoginSchema.parse(req.body);
    if (!credencialesAdminValidas(email, password)) {
      return res.status(401).json({ error: "Credenciales admin inválidas" });
    }

    const admin = datosAdminConfigurado();
    const usuario = await upsertUsuario({
      googleId: `admin:${admin.email}`,
      email: admin.email,
      nombre: admin.nombre,
      esAdmin: true,
    });

    const token = firmarToken({
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      esAdmin: true,
    });

    res.json({ token, usuario: perfilPublico(usuario) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Datos inválidos", detalles: err.flatten() });
    }
    next(err);
  }
});

/** GET /auth/me — datos del usuario autenticado (RF38). */
authRouter.get("/me", autenticar, async (req: ReqConUsuario, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.usuario!.sub } });
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ usuario: perfilPublico(usuario) });
  } catch (err) {
    next(err);
  }
});

function perfilPublico(u: {
  id: string;
  email: string;
  nombre: string;
  avatarUrl: string | null;
  esAdmin: boolean;
}) {
  return { id: u.id, email: u.email, nombre: u.nombre, avatarUrl: u.avatarUrl, esAdmin: u.esAdmin };
}
