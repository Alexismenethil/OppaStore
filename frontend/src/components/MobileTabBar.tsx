"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Home, LayoutGrid, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { useFavorites } from "@/features/favorites/FavoritesContext";

const TABS = [
  { label: "Inicio", href: "/", icono: Home },
  { label: "Catálogo", href: "/catalogo", icono: LayoutGrid },
  { label: "Favoritos", href: "/favoritos", icono: Heart },
] as const;

/** Navegación inferior tipo app para móvil (RNF01, RB15). Oculta en ≥md. */
export function MobileTabBar() {
  const pathname = usePathname();
  const { totalUnidades, abrir, abierto } = useCart();
  const { totalFavoritos } = useFavorites();

  const esActivo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed inset-x-0 bottom-0 z-50 px-margin-mobile pb-[calc(env(safe-area-inset-bottom)+12px)] md:hidden"
    >
      <div className="grid grid-cols-4 rounded-full border border-white/70 bg-white/82 p-xs shadow-[0_18px_48px_rgba(47,106,63,0.16)] backdrop-blur-xl">
        {TABS.map((tab) => {
          const Icono = tab.icono;
          const activo = esActivo(tab.href);
          const activoVisual = activo && !abierto;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={activo ? "page" : undefined}
              className="group relative flex min-h-12 flex-col items-center justify-center gap-[3px] rounded-full py-xs transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95"
            >
              {activoVisual && (
                <motion.span
                  layoutId="tab-activa"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-primary-container/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                />
              )}
              <span className="relative z-10">
                <Icono
                  size={21}
                  className={`transition-all duration-300 ${
                    activoVisual ? "scale-105 text-primary" : "text-on-surface-variant group-hover:text-primary"
                  }`}
                  strokeWidth={activoVisual ? 2.4 : 2}
                />
                {tab.href === "/favoritos" && totalFavoritos > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tertiary-container px-1 text-[9px] font-bold text-on-tertiary-container shadow-sm">
                    {totalFavoritos}
                  </span>
                )}
              </span>
              <span
                className={`relative z-10 font-body text-[10px] transition-colors duration-300 ${
                  activoVisual ? "font-bold text-primary" : "text-on-surface-variant"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* Carrito: abre el drawer */}
        <button
          aria-label="Carrito"
          onClick={abrir}
          className="group relative flex min-h-12 flex-col items-center justify-center gap-[3px] rounded-full py-xs transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95"
        >
          {abierto && (
            <motion.span
              layoutId="tab-activa"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="absolute inset-0 rounded-full bg-primary-container/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
            />
          )}
          <span className="relative z-10">
            <ShoppingCart
              size={21}
              className={`transition-all duration-300 ${
                abierto ? "scale-105 text-primary" : "text-on-surface-variant group-hover:text-primary"
              }`}
              strokeWidth={abierto ? 2.4 : 2}
            />
            <AnimatePresence>
              {totalUnidades > 0 && (
                <motion.span
                  key={totalUnidades}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-on-primary shadow-sm"
                >
                  {totalUnidades}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <span
            className={`relative z-10 font-body text-[10px] transition-colors duration-300 ${
              abierto ? "font-bold text-primary" : "text-on-surface-variant"
            }`}
          >
            Carrito
          </span>
        </button>
      </div>
    </nav>
  );
}
