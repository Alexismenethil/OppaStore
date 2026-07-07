"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import type { Producto } from "@/domain/types";

interface Props {
  productos: Producto[];
  onAgregar?: (p: Producto) => void;
  onFavorito?: (p: Producto) => void;
  favoritos?: string[];
}

/** Grilla de productos con entrada/salida animada al filtrar (fluidez). */
export function ProductGrid({ productos, onAgregar, onFavorito, favoritos = [] }: Props) {
  return (
    <motion.div layout className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {productos.map((p) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductCard
              producto={p}
              onAgregar={onAgregar}
              onFavorito={onFavorito}
              esFavorito={favoritos.includes(p.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
