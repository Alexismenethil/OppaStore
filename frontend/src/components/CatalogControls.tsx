"use client";

import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { CATEGORIA_TODOS } from "@/domain/catalog";

interface Categoria {
  slug: string;
  nombre: string;
}

interface Props {
  categorias: Categoria[];
  categoriaActiva: string;
  onCategoria: (slug: string) => void;
  busqueda: string;
  onBusqueda: (q: string) => void;
}

/** Buscador (RF13) + chips de categoría (RF12) del catálogo. */
export function CatalogControls({
  categorias,
  categoriaActiva,
  onCategoria,
  busqueda,
  onBusqueda,
}: Props) {
  const opciones = [{ slug: CATEGORIA_TODOS, nombre: "Todos" }, ...categorias];

  return (
    <div className="space-y-md">
      <div className="relative max-w-md">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
          placeholder="Buscar productos…"
          aria-label="Buscar productos"
          className="w-full rounded-full border border-outline-variant bg-surface-container-lowest py-sm pl-11 pr-10 text-body-md text-on-surface outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        {busqueda && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => onBusqueda("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Chips: scroll horizontal en móvil, wrap en desktop */}
      <div className="scrollbar-hide -mx-margin-mobile flex gap-sm overflow-x-auto px-margin-mobile pb-xs md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {opciones.map((c) => {
          const activa = c.slug === categoriaActiva;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => onCategoria(c.slug)}
              className="relative shrink-0 whitespace-nowrap rounded-full border border-outline-variant/50 px-md py-sm font-body text-label-lg transition-colors active:scale-95"
            >
              {activa && (
                <motion.span
                  layoutId="chip-activa"
                  className="absolute inset-0 rounded-full border border-primary bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative z-10 ${activa ? "text-on-primary" : "text-on-surface-variant"}`}>
                {c.nombre}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
