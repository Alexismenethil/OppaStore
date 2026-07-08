"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Home, LayoutGrid, ShoppingCart, UserRound } from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { useFavorites } from "@/features/favorites/FavoritesContext";

const MENU = [
  { id: "inicio", label: "Inicio", href: "/", icono: Home },
  { id: "catalogo", label: "Catálogo", href: "/catalogo", icono: LayoutGrid },
  { id: "favoritos", label: "Favoritos", href: "/favoritos", icono: Heart },
];

/** Cabecera fija con navegación esencial, favoritos y carrito (RF01-RF05). */
export function Header() {
  const pathname = usePathname();
  const { totalUnidades, abrir, abierto } = useCart();
  const { totalFavoritos } = useFavorites();
  const [compacto, setCompacto] = useState(false);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    let frame = 0;

    const alDesplazar = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        setCompacto(window.scrollY > 16);
        setProgreso(maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0);
      });
    };

    alDesplazar();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    window.addEventListener("resize", alDesplazar);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", alDesplazar);
      window.removeEventListener("resize", alDesplazar);
    };
  }, []);

  const esActivo = useMemo(
    () => (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    },
    [pathname],
  );

  const itemBase =
    "group relative flex h-11 items-center gap-xs rounded-full px-sm font-body text-label-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-white hover:text-primary hover:shadow-[0_12px_28px_rgba(47,106,63,0.12)] active:scale-95";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left bg-gradient-to-r from-primary via-primary-fixed-dim to-tertiary-container transition-transform duration-150"
        style={{ transform: `scaleX(${progreso})` }}
      />

      <div
        className={`px-margin-mobile transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-gutter ${
          compacto ? "pt-sm" : "pt-0"
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            compacto
              ? "h-14 max-w-[900px] rounded-full border-white/70 bg-white/75 px-sm shadow-[0_16px_44px_rgba(47,106,63,0.14)] backdrop-blur-xl md:h-[58px] md:px-md"
              : "h-16 max-w-[980px] border-transparent bg-transparent px-0 md:h-20"
          }`}
        >
          <Link
            href="/"
            className="group flex shrink-0 items-center rounded-full pr-xs font-heading text-[24px] font-extrabold tracking-tight text-primary transition-transform duration-300 hover:-translate-y-0.5 md:text-headline-md"
          >
            <span className="relative">
              OppaStore
              <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary-fixed-dim opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </span>
          </Link>

          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-xs rounded-full border border-white/65 bg-white/45 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur md:flex"
          >
            {MENU.map(({ id, label, href, icono: Icono }) => {
              const activo = esActivo(href);
              const badge = id === "favoritos" ? totalFavoritos : 0;

              return (
                <Link
                  key={id}
                  href={href}
                  aria-current={activo ? "page" : undefined}
                  className={`${itemBase} ${
                    activo
                      ? "bg-white text-primary shadow-[0_10px_24px_rgba(47,106,63,0.12)]"
                      : "text-on-surface-variant"
                  }`}
                >
                  <Icono size={17} className="transition-transform duration-300 group-hover:scale-110" />
                  <span>{label}</span>
                  <AnimatePresence>
                    {badge > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tertiary-container px-1 text-[10px] font-bold text-on-tertiary-container shadow-sm"
                      >
                        {badge}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {activo && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-sm -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-primary via-primary-fixed-dim to-primary"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}

            <button
              aria-label="Carrito"
              aria-pressed={abierto}
              onClick={abrir}
              className={`${itemBase} ${
                abierto
                  ? "bg-white text-primary shadow-[0_10px_24px_rgba(47,106,63,0.12)]"
                  : "text-on-surface-variant"
              }`}
            >
              <ShoppingCart size={17} className="transition-transform duration-300 group-hover:scale-110" />
              <span>Carrito</span>
              <AnimatePresence>
                {totalUnidades > 0 && (
                  <motion.span
                    key={totalUnidades}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary shadow-sm"
                  >
                    {totalUnidades}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <Link
              href="/cuenta"
              aria-label="Mi cuenta"
              aria-current={esActivo("/cuenta") ? "page" : undefined}
              className={`group relative ml-0.5 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(47,106,63,0.10)] active:scale-95 ${
                esActivo("/cuenta")
                  ? "bg-white text-primary shadow-[0_10px_24px_rgba(47,106,63,0.12)] ring-1 ring-primary/10"
                  : "text-on-surface-variant hover:bg-white/75 hover:text-primary"
              }`}
            >
              <UserRound
                size={20}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:scale-105"
              />
              {esActivo("/cuenta") && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-primary via-primary-fixed-dim to-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
            </Link>
          </nav>

          <div className="flex items-center gap-xs md:hidden">
            <Link
              href="/cuenta"
              aria-label="Mi cuenta"
              className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/75 text-on-surface shadow-[0_10px_24px_rgba(47,106,63,0.12)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:text-primary active:scale-95"
            >
              <UserRound size={20} className="transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <button
              aria-label="Carrito"
              onClick={abrir}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 text-on-surface shadow-[0_10px_24px_rgba(47,106,63,0.12)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:text-primary active:scale-95"
            >
              <ShoppingCart size={21} className="transition-transform duration-300 group-hover:scale-110" />
              <AnimatePresence>
                {totalUnidades > 0 && (
                  <motion.span
                    key={totalUnidades}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary shadow-sm"
                  >
                    {totalUnidades}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
