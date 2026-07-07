"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PackageOpen, WifiOff } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CatalogControls } from "@/components/CatalogControls";
import { ProductGrid } from "@/components/ProductGrid";
import { useProductos } from "./useProductos";
import { filtrarProductos, CATEGORIA_TODOS } from "@/domain/catalog";
import { CATEGORIAS } from "@/data/products.seed";
import { agregarAlCarrito, contarItems } from "@/domain/cart";
import { alternarFavorito } from "@/domain/favorites";
import type { ItemCarrito, Producto } from "@/domain/types";

export function CatalogoView() {
  const params = useSearchParams();
  const { productos, cargando, usandoRespaldo } = useProductos();

  const [categoria, setCategoria] = useState(params.get("categoria") ?? CATEGORIA_TODOS);
  const [busqueda, setBusqueda] = useState("");
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);

  const visibles = useMemo(
    () => filtrarProductos(productos, { categoria, q: busqueda }),
    [productos, categoria, busqueda],
  );

  const agregar = (p: Producto) => setItems((prev) => agregarAlCarrito(prev, p, 1));
  const favorito = (p: Producto) => setFavoritos((prev) => alternarFavorito(prev, p.id));

  return (
    <>
      <Header itemsCarrito={contarItems(items)} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto mt-20 min-h-[60vh] max-w-container-max px-gutter py-xl"
      >
        <header className="mb-lg">
          <h1 className="font-heading text-headline-lg text-on-surface">Catálogo</h1>
          <p className="mt-xs text-body-md text-on-surface-variant">
            Explora nuestra selección de productos asiáticos de tendencia.
          </p>
        </header>

        {usandoRespaldo && (
          <div className="mb-md flex items-center gap-sm rounded-md bg-tertiary-container/60 px-md py-sm text-body-sm text-on-tertiary-container">
            <WifiOff size={16} />
            Mostrando catálogo de ejemplo (sin conexión con el servidor).
          </div>
        )}

        <CatalogControls
          categorias={CATEGORIAS.map((c) => ({ slug: c.slug, nombre: c.nombre }))}
          categoriaActiva={categoria}
          onCategoria={setCategoria}
          busqueda={busqueda}
          onBusqueda={setBusqueda}
        />

        <div className="mt-lg">
          {cargando ? (
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-md bg-surface-container-low" />
              ))}
            </div>
          ) : visibles.length > 0 ? (
            <>
              <p className="mb-md text-body-sm text-on-surface-variant" aria-live="polite">
                {visibles.length} producto(s)
              </p>
              <ProductGrid
                productos={visibles}
                onAgregar={agregar}
                onFavorito={favorito}
                favoritos={favoritos}
              />
            </>
          ) : (
            <div className="flex flex-col items-center gap-md py-xl text-center text-on-surface-variant">
              <PackageOpen size={48} className="text-outline" />
              <p className="text-body-lg">No encontramos productos con esos criterios.</p>
              <button
                type="button"
                onClick={() => {
                  setBusqueda("");
                  setCategoria(CATEGORIA_TODOS);
                }}
                className="rounded-full bg-primary-container px-md py-sm font-body text-label-lg text-on-primary-container"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </motion.main>

      <Footer />
    </>
  );
}
