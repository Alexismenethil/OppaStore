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
  const { totalUnidades, abrir } = useCart();
  const { totalFavoritos } = useFavorites();

  const esActivo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant/40 bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
    >
      <div className="grid grid-cols-4">
        {TABS.map((tab) => {
          const Icono = tab.icono;
          const activo = esActivo(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center gap-[3px] py-sm"
            >
              {activo && (
                <motion.span
                  layoutId="tab-activa"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-x-4 top-1 -z-10 h-8 rounded-full bg-primary-container/50"
                />
              )}
              <span className="relative">
                <Icono
                  size={21}
                  className={activo ? "text-primary" : "text-on-surface-variant"}
                  strokeWidth={activo ? 2.4 : 2}
                />
                {tab.href === "/favoritos" && totalFavoritos > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-tertiary-container text-[9px] font-bold text-on-tertiary-container">
                    {totalFavoritos}
                  </span>
                )}
              </span>
              <span
                className={`font-body text-[10px] ${
                  activo ? "font-bold text-primary" : "text-on-surface-variant"
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
          className="relative flex flex-col items-center gap-[3px] py-sm"
        >
          <span className="relative">
            <ShoppingCart size={21} className="text-on-surface-variant" />
            <AnimatePresence>
              {totalUnidades > 0 && (
                <motion.span
                  key={totalUnidades}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-on-primary"
                >
                  {totalUnidades}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <span className="font-body text-[10px] text-on-surface-variant">Carrito</span>
        </button>
      </div>
    </nav>
  );
}
