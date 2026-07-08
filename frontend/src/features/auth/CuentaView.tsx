"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, ShieldCheck, User, Loader2, Heart, ShoppingBag, LayoutDashboard } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/Toast";

const CONTENEDOR = "mx-auto mt-16 min-h-[70vh] max-w-md px-margin-mobile py-lg md:mt-20 md:py-xl";

/** Página de sesión opcional (RF38, HU14): inicio con Google o perfil. */
export function CuentaView() {
  const { usuario, cargando, iniciarConGoogle, cerrarSesion } = useAuth();
  const { mostrar } = useToast();
  const params = useSearchParams();

  useEffect(() => {
    const error = params.get("error");
    if (!error) return;

    const mensaje =
      error === "admin"
        ? "Tu cuenta no tiene permisos para entrar al panel admin."
        : "No se pudo completar el inicio con Google. Intenta de nuevo.";

    mostrar("aviso", mensaje);
  }, [params, mostrar]);

  if (cargando) {
    return (
      <div className={`${CONTENEDOR} flex items-center justify-center`}>
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (usuario?.esAdmin) return <PerfilAdmin usuario={usuario} onSalir={cerrarSesion} onToast={mostrar} />;
  if (usuario) return <PerfilCliente usuario={usuario} onSalir={cerrarSesion} onToast={mostrar} />;

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={CONTENEDOR}
    >
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/50 text-primary">
          <User size={30} />
        </div>
        <h1 className="mt-md font-heading text-headline-md text-on-surface">Tu cuenta</h1>
        <p className="mt-xs text-body-sm text-on-surface-variant">
          El inicio de sesión es <strong>opcional</strong>: guarda tu carrito y favoritos entre dispositivos.
          Siempre puedes comprar como invitado.
        </p>
      </div>

      <button
        type="button"
        onClick={() => iniciarConGoogle()}
        className="mt-lg flex w-full items-center justify-center gap-sm rounded-full border border-outline-variant bg-surface-container-lowest py-md font-body text-label-lg text-on-surface shadow-sm transition-shadow hover:shadow-md"
      >
        <GoogleIcon />
        Continuar con Google
      </button>

      <p className="mt-md text-center text-[12px] text-on-surface-variant">
        Usamos tu cuenta de Google solo para guardar tu carrito y favoritos. No compartimos tus datos.
      </p>
    </motion.main>
  );
}

function PerfilCliente({
  usuario,
  onSalir,
  onToast,
}: {
  usuario: { nombre: string; email: string; avatarUrl: string | null; esAdmin: boolean };
  onSalir: () => void;
  onToast: (tipo: "exito" | "aviso", mensaje: string) => void;
}) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={CONTENEDOR}
    >
      <div className="flex flex-col items-center text-center">
        {usuario.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={usuario.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover shadow-sm" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container text-headline-md font-heading text-on-primary-container">
            {usuario.nombre.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="mt-md font-heading text-headline-sm text-on-surface">Hola, {usuario.nombre} 👋</h1>
        <p className="text-body-sm text-on-surface-variant">{usuario.email}</p>
      </div>

      <div className="mt-lg space-y-sm rounded-lg bg-surface-container-low p-md">
        <p className="flex items-center gap-sm text-body-sm text-on-surface">
          <ShoppingBag size={17} className="text-primary" /> Tu carrito se guarda en tu cuenta.
        </p>
        <p className="flex items-center gap-sm text-body-sm text-on-surface">
          <Heart size={17} className="text-primary" /> Tus favoritos te siguen entre dispositivos.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          onSalir();
          onToast("exito", "Sesión cerrada. Sigues navegando como invitado.");
        }}
        className="mt-lg flex w-full items-center justify-center gap-sm rounded-full border border-outline-variant py-md font-body text-label-lg text-on-surface transition-colors hover:bg-surface-container-high"
      >
        <LogOut size={17} /> Cerrar sesión
      </button>
    </motion.main>
  );
}

function PerfilAdmin({
  usuario,
  onSalir,
  onToast,
}: {
  usuario: { nombre: string; email: string; avatarUrl: string | null };
  onSalir: () => void;
  onToast: (tipo: "exito" | "aviso", mensaje: string) => void;
}) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={CONTENEDOR}
    >
      <div className="flex flex-col items-center text-center">
        {usuario.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={usuario.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover shadow-sm" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container text-headline-md font-heading text-on-primary-container">
            {usuario.nombre.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="mt-md font-heading text-headline-sm text-on-surface">{usuario.nombre}</h1>
        <p className="text-body-sm text-on-surface-variant">{usuario.email}</p>
        <span className="mt-sm inline-flex items-center gap-xs rounded-full bg-tertiary-container px-sm py-xs font-body text-label-md text-on-tertiary-container">
          <ShieldCheck size={14} /> Sesión administradora
        </span>
      </div>

      <div className="mt-lg rounded-lg bg-surface-container-low p-md">
        <p className="font-body text-body-sm text-on-surface">
          Esta sesión administra productos, pedidos, contenido del inicio y usuarios registrados.
        </p>
      </div>

      <Link
        href="/admin"
        className="mt-lg flex w-full items-center justify-center gap-sm rounded-full bg-primary py-md font-body text-label-lg text-on-primary shadow-sm transition-all hover:shadow-md active:scale-95"
      >
        <LayoutDashboard size={17} /> Ir al panel admin
      </Link>

      <button
        type="button"
        onClick={() => {
          onSalir();
          onToast("exito", "Sesión admin cerrada.");
        }}
        className="mt-lg flex w-full items-center justify-center gap-sm rounded-full border border-outline-variant py-md font-body text-label-lg text-on-surface transition-colors hover:bg-surface-container-high"
      >
        <LogOut size={17} /> Cerrar sesión admin
      </button>
    </motion.main>
  );
}

/** Logo de Google en SVG (sin dependencias externas). */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
