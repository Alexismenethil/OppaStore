"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PackageOpen, WifiOff } from "lucide-react";
import { CatalogControls } from "@/components/CatalogControls";
import { ProductGrid } from "@/components/ProductGrid";
import { useProductos } from "./useProductos";
import { filtrarProductos, CATEGORIA_TODOS } from "@/domain/catalog";
import { CATEGORIAS } from "@/data/products.seed";
import { useCart } from "@/features/cart/CartContext";
import { useFavorites } from "@/features/favorites/FavoritesContext";
import { useToast } from "@/components/ui/Toast";
import type { Producto } from "@/domain/types";

export function CatalogoView() {
  const params = useSearchParams();
  const categoriaParam = params.get("categoria") ?? CATEGORIA_TODOS;

  const { productos, cargando, usandoRespaldo } = useProductos();
  const { agregar } = useCart();
  const favoritosCtx = useFavorites();
  const { mostrar } = useToast();

  const [categoria, setCategoria] = useState(categoriaParam);
  const [busqueda, setBusqueda] = useState("");

  // Sincroniza el filtro cuando se navega con ?categoria= desde el menú.
  useEffect(() => setCategoria(categoriaParam), [categoriaParam]);

  const visibles = useMemo(
    () => filtrarProductos(productos, { categoria, q: busqueda }),
    [productos, categoria, busqueda],
  );

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
          Catálogo
        </h1>
        <p className="mt-xs text-body-sm text-on-surface-variant md:text-body-md">
          Explora nuestra selección de productos asiáticos de tendencia.
        </p>
      </header>

      {usandoRespaldo && (
        <div className="mb-md flex items-center gap-sm rounded-md bg-tertiary-container/60 px-md py-sm text-body-sm text-on-tertiary-container">
          <WifiOff size={16} className="shrink-0" />
          Mostrando catálogo de ejemplo (sin conexión con el servidor).
        </div>
      )}

      {/* Controles pegajosos bajo el header para filtrar sin perder contexto */}
      <div className="sticky top-16 z-30 -mx-margin-mobile bg-background/85 px-margin-mobile py-sm backdrop-blur-md md:top-20 md:mx-0 md:px-0">
        <CatalogControls
          categorias={CATEGORIAS.map((c) => ({ slug: c.slug, nombre: c.nombre }))}
          categoriaActiva={categoria}
          onCategoria={setCategoria}
          busqueda={busqueda}
          onBusqueda={setBusqueda}
        />
      </div>

      <div className="mt-md md:mt-lg">
        {cargando ? (
          <div className="grid grid-cols-2 gap-sm sm:gap-md lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-64 sm:h-72" />
            ))}
          </div>
        ) : visibles.length > 0 ? (
          <>
            <p className="mb-sm text-body-sm text-on-surface-variant md:mb-md" aria-live="polite">
              {visibles.length} producto(s)
            </p>
            <ProductGrid
              productos={visibles}
              onAgregar={alAgregar}
              onFavorito={(p) => favoritosCtx.alternar(p.id)}
              favoritos={favoritosCtx.ids}
            />
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-md py-xl text-center text-on-surface-variant"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-container-low">
              <PackageOpen size={36} className="text-outline" />
            </div>
            <p className="text-body-lg">No encontramos productos con esos criterios 🥺</p>
            <button
              type="button"
              onClick={() => {
                setBusqueda("");
                setCategoria(CATEGORIA_TODOS);
              }}
              className="rounded-full bg-primary-container px-md py-sm font-body text-label-lg text-on-primary-container transition-transform active:scale-95"
            >
              Limpiar filtros
            </button>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
}
