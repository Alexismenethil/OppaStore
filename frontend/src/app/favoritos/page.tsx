"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeartOff } from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import { useProductos } from "@/features/catalog/useProductos";
import { useCart } from "@/features/cart/CartContext";
import { useFavorites } from "@/features/favorites/FavoritesContext";
import { useToast } from "@/components/ui/Toast";
import type { Producto } from "@/domain/types";

/** Lista de favoritos del usuario (HU12, RF36). Sin duplicados por RB08. */
export default function FavoritosPage() {
  const { productos, cargando } = useProductos();
  const { agregar } = useCart();
  const favoritosCtx = useFavorites();
  const { mostrar } = useToast();

  const favoritos = productos.filter((p) => favoritosCtx.esFavorito(p.id));

  const alAgregar = (p: Producto) => {
    const r = agregar(p, 1);
    if (r.ok) mostrar("exito", `"${p.nombre}" agregado al carrito 💚`);
    else mostrar("aviso", r.motivo ?? "No se pudo agregar");
    return r;
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto mt-16 min-h-[60vh] max-w-container-max px-margin-mobile pb-lg md:mt-20 md:px-gutter"
    >
      <header className="py-md md:py-lg">
        <h1 className="font-heading text-headline-md text-on-surface md:text-headline-lg">
          Tus Favoritos
        </h1>
        <p className="mt-xs text-body-sm text-on-surface-variant md:text-body-md">
          Los productos que guardaste para después.
        </p>
      </header>

      {cargando ? (
        <div className="grid grid-cols-2 gap-sm sm:gap-md lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-64 sm:h-72" />
          ))}
        </div>
      ) : favoritos.length > 0 ? (
        <ProductGrid
          productos={favoritos}
          onAgregar={alAgregar}
          onFavorito={(p) => favoritosCtx.alternar(p.id)}
          favoritos={favoritosCtx.ids}
        />
      ) : (
        <div className="flex flex-col items-center gap-md py-xl text-center text-on-surface-variant">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-tertiary-container/50">
            <HeartOff size={34} className="text-on-tertiary-container" />
          </div>
          <p className="text-body-lg">Aún no tienes favoritos 🐼</p>
          <p className="max-w-[280px] text-body-sm">
            Toca el corazón de un producto para guardarlo aquí.
          </p>
          <Link
            href="/catalogo"
            className="rounded-full bg-primary px-lg py-sm font-body text-label-lg text-on-primary transition-transform active:scale-95"
          >
            Explorar catálogo
          </Link>
        </div>
      )}
    </motion.main>
  );
}
