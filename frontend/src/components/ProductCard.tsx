"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Producto } from "@/domain/types";
import type { ResultadoValidacion } from "@/domain/cart";
import { esComprable } from "@/domain/productStatus";
import { formatearSoles } from "@/domain/money";
import { StatusBadge } from "./StatusBadge";

interface Props {
  producto: Producto;
  /** Si devuelve un resultado de validación, el "check" solo se muestra cuando ok. */
  onAgregar?: (p: Producto) => ResultadoValidacion | void;
  onFavorito?: (p: Producto) => void;
  esFavorito?: boolean;
}

/** Tarjeta de producto con microinteracciones (RF14–RF17). */
export function ProductCard({ producto, onAgregar, onFavorito, esFavorito }: Props) {
  const comprable = esComprable(producto);
  const [recienAgregado, setRecienAgregado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const agregar = () => {
    if (!onAgregar) return;
    const resultado = onAgregar(producto);
    if (resultado && !resultado.ok) return; // sin check si la validación falló (RB01)
    setRecienAgregado(true);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setRecienAgregado(false), 1200);
  };

  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="group flex h-full flex-col rounded-md bg-surface-container-lowest p-sm shadow-sm transition-shadow hover:shadow-xl sm:p-md"
    >
      <div className="relative mb-sm aspect-square overflow-hidden rounded-[0.9rem] bg-surface-container-low sm:mb-md sm:rounded-[1rem]">
        <div className="absolute left-2 top-2 z-10 sm:left-3 sm:top-3">
          <StatusBadge producto={producto} />
        </div>

        {onFavorito && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.75 }}
            aria-label="Guardar en favoritos"
            aria-pressed={esFavorito}
            onClick={() => onFavorito(producto)}
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm sm:right-3 sm:top-3 sm:h-9 sm:w-9"
          >
            <motion.span
              key={esFavorito ? "fav" : "no-fav"}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 16 }}
              className={esFavorito ? "text-primary" : "text-on-surface-variant"}
            >
              <Heart size={17} fill={esFavorito ? "currentColor" : "none"} />
            </motion.span>
          </motion.button>
        )}

        {producto.imagenUrl && (
          <Image
            src={producto.imagenUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        )}

        {/* Enlace al detalle sobre la imagen; los botones (z-10) quedan por encima. */}
        <Link
          href={`/producto/${producto.slug}`}
          aria-label={`Ver ${producto.nombre}`}
          className="absolute inset-0 z-[1]"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="font-body text-[13px] font-bold leading-snug text-on-surface transition-colors group-hover:text-primary sm:text-label-lg">
          <Link href={`/producto/${producto.slug}`} className="outline-none focus-visible:underline">
            {producto.nombre}
          </Link>
        </h3>
        <p className="mt-xs line-clamp-2 text-[12px] text-on-surface-variant sm:text-body-sm">
          {producto.descripcion}
        </p>
        <div className="mt-auto flex items-center justify-between pt-sm sm:pt-md">
          <span className="font-heading text-[17px] font-semibold text-on-surface sm:text-headline-sm">
            {formatearSoles(producto.precio)}
          </span>
          <motion.button
            type="button"
            whileTap={comprable ? { scale: 0.82 } : undefined}
            disabled={!comprable}
            aria-label={comprable ? "Agregar al carrito" : "Producto agotado"}
            onClick={agregar}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-colors sm:h-10 sm:w-10 ${
              recienAgregado
                ? "bg-primary-container text-on-primary-container"
                : "bg-primary text-on-primary"
            } disabled:cursor-not-allowed disabled:bg-surface-container-highest disabled:text-outline`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={recienAgregado ? "check" : "cart"}
                initial={{ scale: 0.3, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.3, opacity: 0, rotate: 30 }}
                transition={{ type: "spring", stiffness: 600, damping: 24 }}
                className="block"
              >
                {recienAgregado ? <Check size={18} /> : <ShoppingCart size={17} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
