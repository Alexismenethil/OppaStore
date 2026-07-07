"use client";

import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { Producto } from "@/domain/types";
import { esComprable } from "@/domain/productStatus";
import { formatearSoles } from "@/domain/money";
import { StatusBadge } from "./StatusBadge";

interface Props {
  producto: Producto;
  onAgregar?: (p: Producto) => void;
  onFavorito?: (p: Producto) => void;
  esFavorito?: boolean;
}

/** Tarjeta de producto del catálogo (RF14–RF17). */
export function ProductCard({ producto, onAgregar, onFavorito, esFavorito }: Props) {
  const comprable = esComprable(producto);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group flex flex-col rounded-md bg-surface-container-lowest p-md shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="relative mb-md aspect-square overflow-hidden rounded-[1rem] bg-surface-container-low">
        <div className="absolute left-3 top-3 z-10">
          <StatusBadge producto={producto} />
        </div>
        {onFavorito && (
          <button
            type="button"
            aria-label="Guardar en favoritos"
            aria-pressed={esFavorito}
            onClick={() => onFavorito(producto)}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-on-surface-variant shadow-sm transition-colors hover:text-primary"
          >
            <Heart size={18} fill={esFavorito ? "currentColor" : "none"} />
          </button>
        )}
        {producto.imagenUrl && (
          <Image
            src={producto.imagenUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 100vw, 25vw"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="font-body text-label-lg text-on-surface transition-colors group-hover:text-primary">
          {producto.nombre}
        </h3>
        <p className="mt-xs text-body-sm text-on-surface-variant line-clamp-2">
          {producto.descripcion}
        </p>
        <div className="mt-md flex items-center justify-between">
          <span className="font-heading text-headline-sm text-on-surface">
            {formatearSoles(producto.precio)}
          </span>
          <button
            type="button"
            disabled={!comprable}
            aria-label={comprable ? "Agregar al carrito" : "Producto agotado"}
            onClick={() => onAgregar?.(producto)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm transition-transform enabled:hover:scale-105 enabled:active:scale-95 disabled:cursor-not-allowed disabled:bg-surface-container-highest disabled:text-outline"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
