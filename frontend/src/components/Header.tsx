"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingCart, MessageCircle, Menu, X } from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { useFavorites } from "@/features/favorites/FavoritesContext";

const MENU = [
  { label: "Inicio", href: "/" },
  { label: "Skincare", href: "/catalogo?categoria=skincare" },
  { label: "Snacks & Foods", href: "/catalogo?categoria=snacks" },
  { label: "Colecciones", href: "/catalogo?categoria=colecciones" },
  { label: "Drops", href: "/catalogo?categoria=drops" },
  { label: "Contacto", href: "#contacto" },
];

/** Cabecera fija con menú, favoritos, carrito y CTA WhatsApp (RF01–RF05). */
export function Header() {
  const pathname = usePathname();
  const { totalUnidades, abrir } = useCart();
  const { totalFavoritos } = useFavorites();
  const [conSombra, setConSombra] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Sombra sutil al hacer scroll (profundidad progresiva).
  useEffect(() => {
    const alDesplazar = () => setConSombra(window.scrollY > 8);
    alDesplazar();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => window.removeEventListener("scroll", alDesplazar);
  }, []);

  // Cierra el menú móvil al navegar.
  useEffect(() => setMenuAbierto(false), [pathname]);

  const esActivo = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]) && href !== "/";

  return (
    <header
      className={`fixed top-0 z-50 w-full bg-surface/80 backdrop-blur-md transition-shadow duration-300 ${
        conSombra ? "shadow-md shadow-on-surface/5" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-container-max items-center justify-between px-margin-mobile md:h-20 md:px-gutter">
        <Link
          href="/"
          className="font-heading text-[22px] font-bold tracking-tight text-primary md:text-headline-md"
        >
          OppaStore
        </Link>

        {/* Menú desktop con punto mint en el ítem activo */}
        <nav className="hidden items-center gap-lg md:flex">
          {MENU.map((m) => (
            <Link
              key={m.label}
              href={m.href}
              className={`relative font-body text-label-lg transition-colors hover:text-primary ${
                esActivo(m.href) ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {m.label}
              {esActivo(m.href) && (
                <motion.span
                  layoutId="nav-dot"
                  className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-sm md:gap-md">
          {/* Favoritos (desktop; en móvil vive en la barra inferior) */}
          <Link
            aria-label="Favoritos"
            href="/favoritos"
            className="relative hidden p-xs text-on-surface-variant transition-colors hover:text-primary md:block"
          >
            <Heart size={22} />
            <AnimatePresence>
              {totalFavoritos > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-tertiary-container text-[10px] font-bold text-on-tertiary-container"
                >
                  {totalFavoritos}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Carrito (desktop) — abre el drawer con badge animado */}
          <button
            aria-label="Carrito"
            onClick={abrir}
            className="relative hidden p-xs text-on-surface-variant transition-colors hover:text-primary md:block"
          >
            <ShoppingCart size={22} />
            <AnimatePresence>
              {totalUnidades > 0 && (
                <motion.span
                  key={totalUnidades}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary"
                >
                  {totalUnidades}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={abrir}
            className="hidden items-center gap-sm rounded-full bg-primary px-md py-sm font-body text-label-lg text-on-primary shadow-sm transition-shadow hover:shadow-md lg:flex"
          >
            <MessageCircle size={16} />
            Comprar por WhatsApp
          </motion.button>

          {/* Hamburguesa móvil */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuAbierto((v) => !v)}
            className="p-xs text-on-surface md:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuAbierto ? "cerrar" : "abrir"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="block"
              >
                {menuAbierto ? <X size={24} /> : <Menu size={24} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      <AnimatePresence>
        {menuAbierto && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-outline-variant/40 bg-surface/95 backdrop-blur-md md:hidden"
          >
            <motion.ul
              initial="cerrado"
              animate="abierto"
              variants={{ abierto: { transition: { staggerChildren: 0.045 } } }}
              className="space-y-xs px-margin-mobile py-md"
            >
              {MENU.map((m) => (
                <motion.li
                  key={m.label}
                  variants={{
                    cerrado: { opacity: 0, x: -12 },
                    abierto: { opacity: 1, x: 0 },
                  }}
                >
                  <Link
                    href={m.href}
                    onClick={() => setMenuAbierto(false)}
                    className={`block rounded-md px-sm py-sm font-body text-body-md transition-colors ${
                      esActivo(m.href)
                        ? "bg-primary-container/40 text-primary"
                        : "text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    {m.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
