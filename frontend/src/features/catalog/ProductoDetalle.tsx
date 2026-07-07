"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Maximize2,
  Minus,
  PackageSearch,
  PackageX,
  Plus,
  ShoppingCart,
  X,
} from "lucide-react";
import type { Producto } from "@/domain/types";
import { esComprable, etiquetaEstado, maximoAgregable } from "@/domain/productStatus";
import { formatearSoles } from "@/domain/money";
import { CATEGORIAS } from "@/data/products.seed";
import { StatusBadge } from "@/components/StatusBadge";
import { InfoEspecifica } from "@/components/InfoEspecifica";
import { useCart } from "@/features/cart/CartContext";
import { useFavorites } from "@/features/favorites/FavoritesContext";
import { useToast } from "@/components/ui/Toast";
import { useProducto } from "./useProducto";

const CONTENEDOR = "mx-auto max-w-container-max px-margin-mobile py-lg md:px-gutter md:py-xl";

/** Página de detalle: resuelve el producto por slug y maneja carga/404 (RF18). */
export function ProductoDetalle({ slug }: { slug: string }) {
  const estado = useProducto(slug);

  if (estado.cargando) return <DetalleSkeleton />;
  if (estado.noEncontrado) return <NoEncontrado />;
  return <DetalleProducto producto={estado.producto} />;
}

/** Contenido del detalle. Presentacional + acciones de carrito/favoritos. */
export function DetalleProducto({ producto }: { producto: Producto }) {
  const { agregar, abrir } = useCart();
  const favoritos = useFavorites();
  const { mostrar } = useToast();
  const [cantidad, setCantidad] = useState(1);
  const [indiceImagen, setIndiceImagen] = useState(0);
  const [visorAbierto, setVisorAbierto] = useState(false);

  const comprable = esComprable(producto);
  const maximo = maximoAgregable(producto);
  const marcado = favoritos.esFavorito(producto.id);
  const categoria = CATEGORIAS.find((c) => c.slug === producto.categoria)?.nombre ?? producto.categoria;
  const imagenes = useMemo(() => imagenesProducto(producto), [producto]);
  const imagenActiva = imagenes[indiceImagen];

  useEffect(() => {
    setIndiceImagen(0);
    setVisorAbierto(false);
  }, [producto.id]);

  const ajustar = (delta: number) =>
    setCantidad((c) => Math.min(Math.max(c + delta, 1), Math.max(maximo, 1)));

  const moverImagen = (delta: number) => {
    if (imagenes.length <= 1) return;
    setIndiceImagen((actual) => (actual + delta + imagenes.length) % imagenes.length);
  };

  const agregarAlCarrito = () => {
    const r = agregar(producto, cantidad); // valida stock total (RB01)
    if (!r.ok) {
      mostrar("aviso", r.motivo ?? "No se pudo agregar al carrito");
      return;
    }
    mostrar("exito", `${producto.nombre} agregado al carrito 💚`);
    abrir();
  };

  const alternarFav = () => {
    const quedo = favoritos.alternar(producto.id);
    mostrar("exito", quedo ? "Agregado a favoritos 💚" : "Quitado de favoritos");
  };

  return (
    <article className={CONTENEDOR}>
      <Link
        href="/catalogo"
        className="mb-lg mt-md inline-flex min-h-11 items-center gap-xs rounded-full border border-outline-variant/45 bg-white/80 py-xs pl-xs pr-base font-body text-label-md text-on-surface-variant shadow-sm backdrop-blur-sm transition hover:border-primary/25 hover:text-primary hover:shadow-md md:mb-md md:mt-0 md:min-h-10 md:bg-white/75"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-sm md:h-8 md:w-8">
          <ArrowLeft size={18} />
        </span>
        Volver al catálogo
      </Link>

      <div className="grid gap-lg lg:grid-cols-2 lg:gap-xl">
        {/* Galería */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={imagenes.length > 1 ? "grid grid-cols-[4.25rem_minmax(0,1fr)] gap-sm" : ""}
        >
          {imagenes.length > 1 && (
            <div
              className="flex max-h-[72vw] flex-col gap-xs overflow-y-auto pr-1 sm:max-h-[34rem]"
              aria-label="Fotos del producto"
            >
              {imagenes.map((imagen, indice) => (
                <MiniaturaImagen
                  key={imagen}
                  src={imagen}
                  nombre={producto.nombre}
                  activa={indice === indiceImagen}
                  indice={indice}
                  onClick={() => setIndiceImagen(indice)}
                />
              ))}
            </div>
          )}

          <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-container-low">
            <div className="absolute left-4 top-4 z-20">
              <StatusBadge producto={producto} />
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.8 }}
              aria-label={marcado ? "Quitar de favoritos" : "Guardar en favoritos"}
              aria-pressed={marcado}
              onClick={alternarFav}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            >
              <Heart
                size={19}
                className={marcado ? "text-primary" : "text-on-surface-variant"}
                fill={marcado ? "currentColor" : "none"}
              />
            </motion.button>

            <AnimatePresence mode="wait">
              {imagenActiva && (
                <motion.div
                  key={imagenActiva}
                  initial={{ opacity: 0, scale: 1.015 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={imagenActiva}
                    alt={producto.nombre}
                    fill
                    sizes="(max-width: 1024px) 72vw, 560px"
                    className="object-contain"
                    priority
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {imagenActiva && (
              <>
                <button
                  type="button"
                  aria-label={`Abrir galería de ${producto.nombre}`}
                  onClick={() => setVisorAbierto(true)}
                  className="absolute inset-0 z-10 cursor-zoom-in"
                />
                <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex items-center gap-xs rounded-full bg-white/90 px-sm py-xs text-label-sm text-on-surface shadow-sm backdrop-blur-sm">
                  <Maximize2 size={15} />
                  Ver
                </div>
              </>
            )}

            {imagenes.length > 1 && (
              <>
                <BotonGaleria
                  direccion="anterior"
                  className="left-3 hidden sm:flex"
                  onClick={() => moverImagen(-1)}
                />
                <BotonGaleria
                  direccion="siguiente"
                  className="right-3 hidden sm:flex"
                  onClick={() => moverImagen(1)}
                />
              </>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex flex-col"
        >
          <span className="font-body text-label-md uppercase tracking-wide text-primary">{categoria}</span>
          <h1 className="mt-xs font-heading text-headline-lg leading-tight text-on-surface">{producto.nombre}</h1>
          <p className="mt-sm font-heading text-headline-md text-primary">{formatearSoles(producto.precio)}</p>

          <p className="mt-md text-body-md text-on-surface-variant">{producto.descripcion}</p>

          {/* Disponibilidad (RF18) */}
          <p className="mt-md font-body text-body-sm text-on-surface-variant" data-testid="disponibilidad">
            {comprable
              ? `${etiquetaEstado(producto)} · ${producto.stock} unidad(es) disponible(s)`
              : etiquetaEstado(producto)}
          </p>

          {/* Cantidad + agregar (RF20, RF21) */}
          {comprable ? (
            <div className="mt-lg flex items-center gap-md">
              <div className="flex items-center gap-sm rounded-full border border-outline-variant p-xs">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.8 }}
                  aria-label="Disminuir cantidad"
                  disabled={cantidad <= 1}
                  onClick={() => ajustar(-1)}
                  className="rounded-full p-sm text-on-surface transition-colors enabled:hover:bg-surface-container disabled:opacity-30"
                >
                  <Minus size={16} />
                </motion.button>
                <motion.span
                  key={cantidad}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 24 }}
                  aria-label="Cantidad"
                  className="min-w-6 text-center font-body text-label-lg"
                >
                  {cantidad}
                </motion.span>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.8 }}
                  aria-label="Aumentar cantidad"
                  disabled={cantidad >= maximo}
                  onClick={() => ajustar(1)}
                  className="rounded-full p-sm text-on-surface transition-colors enabled:hover:bg-surface-container disabled:opacity-30"
                >
                  <Plus size={16} />
                </motion.button>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={agregarAlCarrito}
                aria-label="Agregar al carrito"
                className="flex flex-1 items-center justify-center gap-sm rounded-full bg-primary py-md font-body text-label-lg text-on-primary shadow-sm transition-shadow hover:shadow-lg"
              >
                <ShoppingCart size={18} /> Agregar al carrito
              </motion.button>
            </div>
          ) : (
            <button
              type="button"
              disabled
              aria-label="Producto agotado"
              className="mt-lg flex items-center justify-center gap-sm rounded-full bg-surface-container-highest py-md font-body text-label-lg text-outline"
            >
              <PackageX size={18} /> Agotado
            </button>
          )}

          <InfoEspecifica producto={producto} />
        </motion.div>
      </div>

      <VisorGaleria
        abierto={visorAbierto}
        producto={producto}
        imagenes={imagenes}
        indice={indiceImagen}
        onCerrar={() => setVisorAbierto(false)}
        onMover={moverImagen}
        onSeleccionar={setIndiceImagen}
      />
    </article>
  );
}

function imagenesProducto(producto: Producto): string[] {
  const candidatas = [producto.imagenUrl, ...(producto.imagenes ?? [])].filter(
    (src): src is string => Boolean(src),
  );
  return Array.from(new Set(candidatas));
}

function MiniaturaImagen({
  src,
  nombre,
  activa,
  indice,
  onClick,
}: {
  src: string;
  nombre: string;
  activa: boolean;
  indice: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      aria-label={`Ver foto ${indice + 1} de ${nombre}`}
      aria-current={activa ? "true" : undefined}
      onClick={onClick}
      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-surface-container-lowest transition sm:h-16 sm:w-16 ${
        activa
          ? "border-primary shadow-sm ring-2 ring-primary/15"
          : "border-outline-variant/40 opacity-75 hover:border-primary/45 hover:opacity-100"
      }`}
    >
      <Image src={src} alt="" fill sizes="64px" className="object-cover" />
    </motion.button>
  );
}

function BotonGaleria({
  direccion,
  className,
  onClick,
}: {
  direccion: "anterior" | "siguiente";
  className?: string;
  onClick: () => void;
}) {
  const Icono = direccion === "anterior" ? ChevronLeft : ChevronRight;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      aria-label={direccion === "anterior" ? "Foto anterior" : "Foto siguiente"}
      onClick={onClick}
      className={`absolute top-1/2 z-20 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-on-surface shadow-sm backdrop-blur-sm transition hover:bg-white hover:shadow-md ${className ?? ""}`}
    >
      <Icono size={18} />
    </motion.button>
  );
}

function VisorGaleria({
  abierto,
  producto,
  imagenes,
  indice,
  onCerrar,
  onMover,
  onSeleccionar,
}: {
  abierto: boolean;
  producto: Producto;
  imagenes: string[];
  indice: number;
  onCerrar: () => void;
  onMover: (delta: number) => void;
  onSeleccionar: (indice: number) => void;
}) {
  const imagen = imagenes[indice];

  useEffect(() => {
    if (!abierto) return;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowLeft") onMover(-1);
      if (e.key === "ArrowRight") onMover(1);
    };

    window.addEventListener("keydown", alTeclear);
    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [abierto, onCerrar, onMover]);

  return (
    <AnimatePresence>
      {abierto && imagen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[90] bg-on-background/55 p-margin-mobile backdrop-blur-md md:p-lg"
        >
          <button type="button" aria-label="Cerrar galería" onClick={onCerrar} className="absolute inset-0" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Galería de ${producto.nombre}`}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            className="relative z-10 mx-auto grid h-full max-w-6xl grid-rows-[auto_minmax(0,1fr)_auto] gap-sm"
          >
            <div className="flex items-center justify-between gap-sm">
              <span className="rounded-full bg-white/90 px-sm py-xs text-label-sm text-on-surface shadow-sm backdrop-blur-sm">
                {indice + 1} / {imagenes.length}
              </span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                aria-label="Cerrar galería"
                onClick={onCerrar}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-on-surface shadow-sm backdrop-blur-sm transition hover:bg-white"
              >
                <X size={21} />
              </motion.button>
            </div>

            <div className="relative min-h-0 overflow-hidden rounded-lg bg-surface/90 shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={imagen}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.015 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={imagen}
                    alt={producto.nombre}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {imagenes.length > 1 && (
                <>
                  <BotonGaleria direccion="anterior" className="left-4 flex" onClick={() => onMover(-1)} />
                  <BotonGaleria direccion="siguiente" className="right-4 flex" onClick={() => onMover(1)} />
                </>
              )}
            </div>

            {imagenes.length > 1 && (
              <div className="flex gap-xs overflow-x-auto rounded-full bg-white/80 p-xs shadow-sm backdrop-blur-sm">
                {imagenes.map((src, i) => (
                  <MiniaturaImagen
                    key={src}
                    src={src}
                    nombre={producto.nombre}
                    activa={i === indice}
                    indice={i}
                    onClick={() => onSeleccionar(i)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Esqueleto de carga (RNF07). */
function DetalleSkeleton() {
  return (
    <div className={CONTENEDOR} aria-hidden>
      <div className="mb-md h-4 w-40 animate-pulse rounded-full bg-surface-container-high" />
      <div className="grid gap-lg lg:grid-cols-2 lg:gap-xl">
        <div className="aspect-square animate-pulse rounded-lg bg-surface-container-high" />
        <div className="space-y-md">
          <div className="h-4 w-24 animate-pulse rounded-full bg-surface-container-high" />
          <div className="h-9 w-3/4 animate-pulse rounded-full bg-surface-container-high" />
          <div className="h-7 w-32 animate-pulse rounded-full bg-surface-container-high" />
          <div className="h-20 w-full animate-pulse rounded-md bg-surface-container-high" />
          <div className="h-12 w-full animate-pulse rounded-full bg-surface-container-high" />
        </div>
      </div>
    </div>
  );
}

/** Estado 404: producto inexistente o inactivo (RB10). */
function NoEncontrado() {
  return (
    <div className={`${CONTENEDOR} flex flex-col items-center py-xl text-center`}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container/40">
        <PackageSearch size={34} className="text-primary" />
      </div>
      <h1 className="mt-md font-heading text-headline-sm text-on-surface">Producto no encontrado 🐼</h1>
      <p className="mt-sm max-w-sm text-body-sm text-on-surface-variant">
        Este producto ya no está disponible o el enlace no es válido.
      </p>
      <Link
        href="/catalogo"
        className="mt-lg rounded-full bg-primary px-lg py-sm font-body text-label-lg text-on-primary transition-transform active:scale-95"
      >
        Ir al catálogo
      </Link>
    </div>
  );
}
