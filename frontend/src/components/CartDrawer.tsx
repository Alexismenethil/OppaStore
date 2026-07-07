"use client";

import { useEffect, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";
import type { ItemCarrito } from "@/domain/types";
import { subtotalItem, totalCarrito } from "@/domain/cart";
import { formatearSoles } from "@/domain/money";

interface Props {
  abierto: boolean;
  items: ItemCarrito[];
  /** Paso del flujo: lista del carrito o formulario de datos del cliente. */
  paso?: "carrito" | "datos";
  onCerrar: () => void;
  onIncrementar: (item: ItemCarrito) => void;
  onDecrementar: (item: ItemCarrito) => void;
  onEliminar: (item: ItemCarrito) => void;
  /** Avanza del carrito al paso de datos del cliente. */
  onContinuar: () => void;
  /** Vuelve del paso de datos al carrito. */
  onVolver?: () => void;
  /** Formulario de checkout, renderizado en el paso "datos". */
  checkout?: ReactNode;
}

/**
 * Carrito lateral (mockup oppastore_carrito_lateral).
 * Paso 1 (RF22–RF26): lista, cantidades con límite de stock, eliminar, totales en vivo.
 * Paso 2 (RF27): datos del cliente antes de registrar el pedido y abrir WhatsApp.
 */
export function CartDrawer({
  abierto,
  items,
  paso = "carrito",
  onCerrar,
  onIncrementar,
  onDecrementar,
  onEliminar,
  onContinuar,
  onVolver,
  checkout,
}: Props) {
  // Bloquea el scroll del fondo y cierra con Escape mientras está abierto.
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [abierto, onCerrar]);

  const total = totalCarrito(items);
  const enDatos = paso === "datos" && items.length > 0;

  return (
    <AnimatePresence>
      {abierto && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onCerrar}
            className="fixed inset-0 z-[70] bg-on-background/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="fixed right-0 top-0 z-[80] flex h-dvh w-full max-w-[400px] flex-col rounded-l-lg bg-surface p-md shadow-2xl"
          >
            <div className="mb-md flex items-center justify-between gap-sm">
              <div className="flex items-center gap-xs">
                {enDatos && onVolver && (
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    aria-label="Volver al carrito"
                    onClick={onVolver}
                    className="-ml-1 rounded-full p-base text-on-surface-variant transition-colors hover:bg-surface-container-high"
                  >
                    <ArrowLeft size={20} />
                  </motion.button>
                )}
                <div>
                  <h2 className="font-heading text-headline-sm text-primary">
                    {enDatos ? "Tus datos" : "Tu Carrito"}
                  </h2>
                  <p className="text-body-sm text-on-surface-variant">
                    {enDatos ? "Para coordinar tu entrega" : "¿Listo para completar tu pedido?"}
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                aria-label="Cerrar carrito"
                onClick={onCerrar}
                className="rounded-full p-base text-on-surface-variant transition-colors hover:bg-surface-container-high"
              >
                <X size={22} />
              </motion.button>
            </div>

            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-1 flex-col items-center justify-center gap-md text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container/40">
                  <ShoppingBag size={34} className="text-primary" />
                </div>
                <p className="font-body text-body-lg text-on-surface">Tu carrito está vacío 🐼</p>
                <p className="max-w-[240px] text-body-sm text-on-surface-variant">
                  Descubre skincare coreano, snacks y peluches kawaii.
                </p>
                <Link
                  href="/catalogo"
                  onClick={onCerrar}
                  className="rounded-full bg-primary px-lg py-sm font-body text-label-lg text-on-primary transition-transform active:scale-95"
                >
                  Explorar catálogo
                </Link>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                {enDatos ? (
                  <motion.div
                    key="datos"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.22 }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    {checkout}
                  </motion.div>
                ) : (
                  <motion.div
                    key="carrito"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.22 }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <div className="flex-1 space-y-sm overflow-y-auto pr-1">
                      <AnimatePresence initial={false}>
                        {items.map((item) => {
                          const enLimite = item.cantidad >= item.producto.stock;
                          return (
                            <motion.div
                              key={item.producto.id}
                              layout
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
                              transition={{ type: "spring", stiffness: 420, damping: 34 }}
                              className="flex gap-sm rounded-md border border-outline-variant/30 bg-surface-container-lowest p-sm"
                            >
                              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[0.75rem] bg-surface-container-low">
                                {item.producto.imagenUrl && (
                                  <Image
                                    src={item.producto.imagenUrl}
                                    alt={item.producto.nombre}
                                    fill
                                    sizes="80px"
                                    className="object-contain"
                                  />
                                )}
                              </div>
                              <div className="flex flex-1 flex-col justify-between py-xs">
                                <div>
                                  <h4 className="font-body text-label-lg leading-snug text-on-surface">
                                    {item.producto.nombre}
                                  </h4>
                                  <p className="mt-xs text-body-sm font-bold text-primary">
                                    {formatearSoles(subtotalItem(item))}
                                  </p>
                                </div>
                                <div className="mt-xs flex items-center gap-sm">
                                  <div className="flex items-center gap-xs rounded-full border border-outline-variant px-xs py-xs">
                                    <motion.button
                                      whileTap={{ scale: 0.8 }}
                                      aria-label={`Disminuir cantidad de ${item.producto.nombre}`}
                                      disabled={item.cantidad <= 1}
                                      onClick={() => onDecrementar(item)}
                                      className="rounded-full p-xs text-on-surface transition-colors enabled:hover:bg-surface-container disabled:opacity-30"
                                    >
                                      <Minus size={14} />
                                    </motion.button>
                                    <motion.span
                                      key={item.cantidad}
                                      initial={{ scale: 1.35 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 600, damping: 24 }}
                                      className="min-w-5 text-center font-body text-label-lg"
                                      aria-label={`Cantidad de ${item.producto.nombre}`}
                                    >
                                      {item.cantidad}
                                    </motion.span>
                                    <motion.button
                                      whileTap={{ scale: 0.8 }}
                                      aria-label={`Aumentar cantidad de ${item.producto.nombre}`}
                                      disabled={enLimite}
                                      onClick={() => onIncrementar(item)}
                                      className="rounded-full p-xs text-on-surface transition-colors enabled:hover:bg-surface-container disabled:opacity-30"
                                    >
                                      <Plus size={14} />
                                    </motion.button>
                                  </div>
                                  <button
                                    onClick={() => onEliminar(item)}
                                    className="font-body text-[12px] text-error hover:underline"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                                {enLimite && (
                                  <p className="mt-xs text-[11px] text-on-surface-variant">
                                    Solo {item.producto.stock} disponible(s)
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    {/* Resumen y CTA */}
                    <div className="mt-md border-t border-outline-variant pt-md">
                      <div className="mb-md flex items-baseline justify-between">
                        <span className="font-heading text-headline-sm">Total</span>
                        <motion.span
                          key={total}
                          initial={{ scale: 1.15, opacity: 0.6 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 26 }}
                          className="font-heading text-headline-sm text-primary"
                          data-testid="total-carrito"
                        >
                          {formatearSoles(total)}
                        </motion.span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={onContinuar}
                        className="flex w-full items-center justify-center gap-sm rounded-full bg-primary py-md font-body text-label-lg text-on-primary shadow-sm transition-shadow hover:shadow-lg"
                      >
                        Continuar
                        <ArrowRight size={17} />
                      </motion.button>
                      <p className="mt-sm text-center text-[12px] italic text-on-surface-variant">
                        Coordinaremos el pago y la entrega por WhatsApp 💬
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
