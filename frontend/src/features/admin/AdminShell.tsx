"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Home,
  Settings,
  Users,
  Store,
  Loader2,
  ShieldCheck,
  LockKeyhole,
  Mail,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

const NAV = [
  { href: "/admin", label: "Tablero", icono: LayoutDashboard, exacto: true },
  { href: "/admin/productos", label: "Productos", icono: Package },
  { href: "/admin/pedidos", label: "Pedidos", icono: ShoppingBag },
  { href: "/admin/inicio", label: "Inicio", icono: Home },
  { href: "/admin/config", label: "Configuración", icono: Settings },
  { href: "/admin/usuarios", label: "Usuarios", icono: Users },
];

/**
 * Chrome del panel admin con guardia de acceso (RF42/CP21): el panel se abre
 * solo con credenciales admin. La cuenta Google pública permanece para clientes.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { usuario, cargando, iniciarAdmin, cerrarSesion } = useAuth();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const permitido = Boolean(usuario?.esAdmin);

  useEffect(() => {
    const nav = navRef.current;
    const item = nav?.querySelector<HTMLElement>("[data-admin-active='true']");
    if (!nav || !item) return;
    const left = item.offsetLeft - nav.clientWidth / 2 + item.clientWidth / 2;
    if (typeof nav.scrollTo === "function") {
      nav.scrollTo({ left, behavior: "smooth" });
    } else {
      nav.scrollLeft = left;
    }
  }, [pathname, permitido]);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await iniciarAdmin(email, password);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión como administrador");
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eef7fb_0%,#ffffff_46%,#f3faf5_100%)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-[0_18px_40px_rgba(35,75,54,0.12)] ring-1 ring-white/80">
          <Loader2 className="animate-spin text-primary" size={30} />
        </div>
      </div>
    );
  }

  if (!permitido) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eef7fb_0%,#ffffff_52%,#f4faf6_100%)] px-margin-mobile py-xl">
        <div className="w-full max-w-md rounded-[30px] border border-white/80 bg-white/90 p-lg shadow-[0_24px_70px_rgba(35,75,54,0.12)] ring-1 ring-outline-variant/40 backdrop-blur md:p-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-container/70 text-primary shadow-[0_14px_30px_rgba(45,111,66,0.14)]">
            <ShieldCheck size={28} />
          </div>
          <div className="mt-md text-center">
            <h1 className="font-heading text-headline-sm text-on-surface">Acceso administrador</h1>
            <p className="mt-sm font-body text-body-md text-on-surface-variant">
              El panel admin usa un acceso independiente con correo y contraseña. La cuenta Google queda solo
              para clientes de la tienda.
            </p>
          </div>

          {usuario && !usuario.esAdmin && (
            <div className="mt-lg rounded-[1.25rem] border border-outline-variant/40 bg-surface-container-low/75 p-md shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
              <p className="font-body text-body-sm text-on-surface">
                Tienes una sesión de cliente abierta como <strong>{usuario.email}</strong>.
              </p>
              <p className="mt-xs font-body text-body-sm text-on-surface-variant">
                Puedes entrar con las credenciales admin o cerrar esa sesión primero.
              </p>
              <button
                type="button"
                onClick={cerrarSesion}
                className="mt-sm inline-flex items-center gap-xs font-body text-label-lg text-primary transition-colors hover:opacity-80"
              >
                <LogOut size={15} /> Cerrar sesión actual
              </button>
            </div>
          )}

          <form onSubmit={enviar} className="mt-lg space-y-md">
            <label className="block">
              <span className="mb-xs flex items-center gap-xs font-body text-label-md text-on-surface">
                <Mail size={15} /> Correo administrador
              </span>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@oppastore.pe"
                className="w-full rounded-[1.1rem] border border-outline-variant/60 bg-white px-md py-sm font-body text-body-md text-on-surface outline-none transition-all duration-200 placeholder:text-on-surface-variant/60 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                required
              />
            </label>

            <label className="block">
              <span className="mb-xs flex items-center gap-xs font-body text-label-md text-on-surface">
                <LockKeyhole size={15} /> Contraseña
              </span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full rounded-[1.1rem] border border-outline-variant/60 bg-white px-md py-sm font-body text-body-md text-on-surface outline-none transition-all duration-200 placeholder:text-on-surface-variant/60 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                required
              />
            </label>

            {error && (
              <p className="rounded-2xl bg-error-container px-md py-sm font-body text-body-sm text-on-error-container">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="flex w-full items-center justify-center gap-sm rounded-full bg-primary py-md font-body text-label-lg text-on-primary shadow-[0_16px_34px_rgba(45,111,66,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(45,111,66,0.28)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {enviando ? <Loader2 className="animate-spin" size={17} /> : <LockKeyhole size={17} />}
              Entrar al panel
            </button>
          </form>

          <div className="mt-md flex flex-col items-center gap-sm text-center">
            <p className="font-body text-[12px] text-on-surface-variant">
              Este acceso no usa Google. Si vienes a comprar, entra desde tu cuenta normal.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-xs font-body text-label-lg text-on-surface-variant transition-colors hover:text-primary"
            >
              <Store size={15} /> Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activo = (item: (typeof NAV)[number]) =>
    item.exacto ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef7fb_0%,#ffffff_42%,#f5fbf7_100%)]">
      <header className="sticky top-0 z-40 px-margin-mobile pt-sm backdrop-blur md:px-gutter">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-md rounded-[1.65rem] border border-white/80 bg-white/90 px-sm py-xs shadow-[0_18px_48px_rgba(35,75,54,0.10)] ring-1 ring-outline-variant/40 backdrop-blur-xl md:px-md">
          <div className="flex items-center gap-sm">
            <Link href="/admin" className="font-heading text-headline-sm font-bold text-primary transition-opacity hover:opacity-85">
              OppaStore
            </Link>
            <span className="rounded-full bg-primary-container/75 px-sm py-0.5 font-body text-label-md text-on-primary-container">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-sm">
            <Link
              href="/"
              className="hidden items-center gap-xs rounded-full border border-outline-variant/60 bg-white px-md py-1.5 font-body text-label-md text-on-surface-variant shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary sm:flex"
            >
              <Store size={15} /> Ver tienda
            </Link>
            {usuario && (
              <span className="hidden max-w-[140px] truncate font-body text-label-md text-on-surface-variant sm:block">
                {usuario.nombre}
              </span>
            )}
          </div>
        </div>

        <nav ref={navRef} className="mx-auto mt-xs flex max-w-6xl gap-xs overflow-x-auto rounded-[1.35rem] px-0 pb-sm md:px-0">
          {NAV.map((item) => {
            const Icono = item.icono;
            const on = activo(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-admin-active={on ? "true" : undefined}
                aria-current={on ? "page" : undefined}
                className={`flex shrink-0 items-center gap-xs rounded-full px-md py-2 font-body text-label-md transition-all duration-200 ${
                  on
                    ? "bg-primary text-on-primary shadow-[0_12px_26px_rgba(45,111,66,0.18)]"
                    : "bg-white/60 text-on-surface-variant hover:-translate-y-0.5 hover:bg-white hover:text-primary hover:shadow-sm"
                }`}
              >
                <Icono size={15} /> {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-margin-mobile py-lg md:px-gutter md:py-xl">{children}</main>
    </div>
  );
}
