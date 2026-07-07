"use client";

import Link from "next/link";
import { Heart, Search, ShoppingCart, MessageCircle } from "lucide-react";

const MENU = [
  { label: "Inicio", href: "/" },
  { label: "Skincare", href: "/catalogo?categoria=skincare" },
  { label: "Snacks & Foods", href: "/catalogo?categoria=snacks" },
  { label: "Colecciones", href: "/catalogo?categoria=colecciones" },
  { label: "Drops", href: "/drops" },
  { label: "Contacto", href: "#contacto" },
];

/** Cabecera fija con logo, menú, buscador, favoritos y carrito (RF01–RF05). */
export function Header({ itemsCarrito = 0 }: { itemsCarrito?: number }) {
  return (
    <header className="fixed top-0 z-50 w-full bg-surface/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-container-max items-center justify-between px-gutter">
        <Link href="/" className="font-heading text-headline-md tracking-tight text-primary">
          OppaStore
        </Link>

        <nav className="hidden items-center gap-lg md:flex">
          {MENU.map((m) => (
            <Link
              key={m.label}
              href={m.href}
              className="font-body text-label-lg text-on-surface-variant transition-colors hover:text-primary"
            >
              {m.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-md">
          <button aria-label="Buscar" className="text-on-surface-variant hover:text-primary">
            <Search size={22} />
          </button>
          <Link aria-label="Favoritos" href="/favoritos" className="text-on-surface-variant hover:text-primary">
            <Heart size={22} />
          </Link>
          <Link aria-label="Carrito" href="/carrito" className="relative text-on-surface-variant hover:text-primary">
            <ShoppingCart size={22} />
            {itemsCarrito > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-on-primary">
                {itemsCarrito}
              </span>
            )}
          </Link>
          <button className="hidden items-center gap-sm rounded-full bg-primary px-md py-sm font-body text-label-lg text-on-primary transition-transform active:scale-95 lg:flex">
            <MessageCircle size={16} />
            Comprar por WhatsApp
          </button>
        </div>
      </div>
    </header>
  );
}
