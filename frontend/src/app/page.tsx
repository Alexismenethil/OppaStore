"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageCircle,
  ArrowRight,
  Headset,
  Truck,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import { DropCountdown } from "@/components/DropCountdown";
import { useProductos } from "@/features/catalog/useProductos";
import { useDestacados } from "@/features/catalog/useDestacados";
import { useCart } from "@/features/cart/CartContext";
import { useFavorites } from "@/features/favorites/FavoritesContext";
import { useToast } from "@/components/ui/Toast";
import { useSiteConfig } from "@/features/config/ConfigContext";
import { formatearSoles } from "@/domain/money";
import type { Producto } from "@/domain/types";

const PASOS = [
  { n: 1, titulo: "Elige tus favoritos", texto: "Navega por el catálogo y selecciona lo que más te guste." },
  { n: 2, titulo: "Revisa tu carrito", texto: "Asegúrate de tener todo antes de finalizar tu pedido." },
  { n: 3, titulo: "Pide por WhatsApp", texto: "Coordinamos el pago (Yape/Plin/Efectivo) y la entrega." },
];

const CONFIANZA = [
  { icono: Headset, titulo: "Atención directa", texto: "Resolvemos tus dudas al instante por chat." },
  { icono: Truck, titulo: "Envíos en Ayacucho", texto: "Entregas rápidas y seguras en toda la ciudad." },
  { icono: BadgeCheck, titulo: "Selección curada", texto: "Productos 100% originales elegidos con amor." },
];

const contenedor = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const aparece = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function HomePage() {
  const { productos } = useProductos();
  const { destacados: masVendidos } = useDestacados(4);
  const { config, categorias } = useSiteConfig();
  const { agregar, abrir } = useCart();
  const favoritosCtx = useFavorites();
  const { mostrar } = useToast();

  // "Los más pedidos" viene de ventas reales (RF48); si aún no hay, respaldo local.
  const destacados =
    masVendidos.length > 0 ? masVendidos : productos.filter((p) => p.destacado).slice(0, 4);
  // El drop del inicio lo elige el admin; si no, el primer drop en preventa.
  const drop =
    productos.find((p) => p.id === config.dropHomeProductoId) ??
    productos.find((p) => p.tipo === "drop" && p.esPreventa);

  const alAgregar = (p: Producto) => {
    const r = agregar(p, 1);
    if (r.ok) mostrar("exito", `"${p.nombre}" agregado al carrito 💚`);
    else mostrar("aviso", r.motivo ?? "No se pudo agregar");
    return r;
  };

  const alFavorito = (p: Producto) => {
    favoritosCtx.alternar(p.id);
  };

  return (
    <main className="mt-16 md:mt-20">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-margin-mobile md:px-gutter">
        <div className="animate-float absolute -right-24 -top-24 -z-10 h-[380px] w-[380px] organic-shape-1 bg-primary-container/25 md:h-[560px] md:w-[560px]" />
        <div
          className="animate-float absolute -left-24 top-2/3 -z-10 h-[280px] w-[280px] organic-shape-2 bg-secondary-container/30 md:h-[400px] md:w-[400px]"
          style={{ animationDelay: "-2s" }}
        />
        <div className="mx-auto grid max-w-container-max items-center gap-lg py-lg md:min-h-[82vh] md:grid-cols-2 md:py-xl">
          <motion.div
            variants={contenedor}
            initial="hidden"
            animate="visible"
            className="space-y-md text-center md:space-y-lg md:text-left"
          >
            <motion.div variants={aparece} className="flex justify-center gap-sm md:justify-start">
              <span className="rounded-full bg-tertiary-container px-md py-xs font-body text-label-md text-on-tertiary-container">
                Stock limitado
              </span>
              <span className="rounded-full bg-primary-container px-md py-xs font-body text-label-md text-on-primary-container">
                Productos virales
              </span>
            </motion.div>
            <motion.h1
              variants={aparece}
              className="font-heading text-[34px] font-bold leading-[1.15] text-on-surface sm:text-headline-lg lg:text-display-lg"
            >
              Tendencias asiáticas que llegan a{" "}
              <span className="italic text-primary">Ayacucho</span>
            </motion.h1>
            <motion.p
              variants={aparece}
              className="mx-auto max-w-xl text-body-md text-on-surface-variant sm:text-body-lg md:mx-0"
            >
              Descubre la cosmética coreana y la ternura de los productos kawaii. Curados para ti,
              directo a tu WhatsApp.
            </motion.p>
            <motion.div
              variants={aparece}
              className="flex flex-col justify-center gap-sm sm:flex-row sm:gap-md md:justify-start"
            >
              <Link
                href="/catalogo"
                className="whitespace-nowrap rounded-full bg-primary px-lg py-md text-center font-body text-label-lg text-on-primary shadow-sm transition-all hover:shadow-lg active:scale-95 md:px-xl"
              >
                Ver productos
              </Link>
              <button
                onClick={abrir}
                className="flex items-center justify-center gap-sm whitespace-nowrap rounded-full border-2 border-primary px-lg py-md font-body text-label-lg text-primary transition-all hover:bg-primary-container active:scale-95 md:px-xl"
              >
                <MessageCircle size={18} /> Comprar por WhatsApp
              </button>
            </motion.div>
          </motion.div>

          {/* Composición visual del mockup: glass card + panda flotante */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto hidden aspect-square w-full max-w-md md:block"
          >
            <div className="glass-card h-full w-full rounded-xl p-md shadow-xl">
              <div className="relative h-full w-full overflow-hidden rounded-lg">
                {config.heroFlatLayUrl && (
                  <Image
                    src={config.heroFlatLayUrl}
                    alt="Skincare coreano sobre superficie clara con hojas de menta"
                    fill
                    priority
                    sizes="(max-width: 768px) 90vw, 440px"
                    className="object-cover"
                  />
                )}
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -right-6 w-40 rounded-lg bg-white p-sm shadow-2xl lg:-right-10 lg:w-48"
            >
              <div className="relative aspect-square overflow-hidden rounded-[0.9rem]">
                {config.heroPandaUrl && (
                  <Image
                    src={config.heroPandaUrl}
                    alt="Peluche panda kawaii con bufanda roja"
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                )}
              </div>
              <p className="mt-xs text-center font-body text-label-md text-primary">
                {config.heroPandaEtiqueta ?? "Novedad Kawaii"}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Categorías (imágenes del mockup) ─────────────────── */}
      <section className="mx-auto max-w-container-max px-margin-mobile py-lg md:px-gutter md:py-xl">
        <div className="mb-md md:mb-lg">
          <h2 className="font-heading text-headline-sm text-on-surface md:text-headline-lg">
            Explora por Categorías
          </h2>
          <div className="mt-sm h-1 w-16 rounded-full bg-primary md:w-20" />
        </div>
        <motion.div
          variants={contenedor}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 gap-sm sm:gap-md lg:grid-cols-3"
        >
          {categorias.map((c) => {
            return (
              <motion.div key={c.slug} variants={aparece}>
                <Link
                  href={`/catalogo?categoria=${c.slug}`}
                  className="group relative block h-32 overflow-hidden rounded-md shadow-sm transition-shadow hover:shadow-xl sm:h-44 md:rounded-lg"
                >
                  {c.imagenUrl && (
                    <Image
                      src={c.imagenUrl}
                      alt={c.nombre}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${c.overlay ?? "from-surface/80"} to-transparent`}
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-sm sm:p-md">
                    <span className="font-heading text-[15px] font-semibold text-on-surface sm:text-headline-sm">
                      {c.nombre}
                    </span>
                    <span className="flex items-center gap-xs font-body text-label-md text-on-surface-variant transition-transform group-hover:translate-x-1.5">
                      Ver más <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Drop de temporada (countdown) ─────────────────────── */}
      {drop?.fechaEstimadaLlegada && (
        <section className="bg-surface-container-low px-margin-mobile py-lg md:px-gutter md:py-xl">
          <div className="mx-auto grid max-w-container-max items-center gap-lg md:grid-cols-2 md:gap-xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-lg bg-white p-sm shadow-2xl sm:p-md md:rounded-xl"
            >
              <span className="absolute right-4 top-4 z-10 rounded-full bg-error px-md py-xs font-body text-label-md text-on-error">
                Próximo Drop
              </span>
              <div className="relative h-56 overflow-hidden rounded-md sm:h-80">
                {drop.imagenUrl && (
                  <Image
                    src={drop.imagenUrl}
                    alt={drop.nombre}
                    fill
                    sizes="(max-width: 768px) 90vw, 560px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex items-end justify-between p-sm sm:p-md">
                <div>
                  <h3 className="font-heading text-[17px] font-semibold text-on-surface sm:text-headline-md">
                    {drop.nombre.split("—")[0].trim()}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">Edición Ayacucho Flora</p>
                </div>
                <div className="font-heading text-headline-sm text-primary sm:text-headline-md">
                  {formatearSoles(drop.precio)}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="space-y-md md:space-y-lg"
            >
              <span className="flex items-center gap-xs font-body text-label-lg uppercase tracking-widest text-primary">
                <Sparkles size={15} /> Lanzamiento exclusivo
              </span>
              <h2 className="font-heading text-headline-md text-on-surface md:text-headline-lg lg:text-display-lg">
                Drops de Temporada
              </h2>
              <p className="text-body-md text-on-surface-variant md:text-body-lg">
                Cada mes traemos una selección limitada que no vuelve a repetirse. Productos
                virales en Seúl que ahora pueden ser tuyos en Ayacucho.
              </p>
              <DropCountdown fechaISO={drop.fechaEstimadaLlegada} />
              <Link
                href="/catalogo?categoria=drops"
                className="inline-block w-full rounded-full bg-on-surface px-lg py-md text-center font-body text-label-lg text-surface transition-all hover:shadow-xl active:scale-95 md:w-auto md:px-xl"
              >
                Ver los drops
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Destacados ────────────────────────────────────────── */}
      <section className="mx-auto max-w-container-max px-margin-mobile py-lg md:px-gutter md:py-xl">
        <div className="mb-md flex items-end justify-between gap-md md:mb-lg">
          <div>
            <h2 className="font-heading text-headline-sm text-on-surface md:text-headline-lg">
              Los más pedidos
            </h2>
            <p className="mt-xs text-body-sm text-on-surface-variant md:text-body-md">
              Favoritos de la comunidad OppaStore
            </p>
          </div>
          <Link
            href="/catalogo"
            className="flex shrink-0 items-center gap-xs font-body text-label-lg text-primary hover:underline"
          >
            Ver todo <ArrowRight size={16} />
          </Link>
        </div>
        {destacados.length > 0 ? (
          <ProductGrid
            productos={destacados}
            onAgregar={alAgregar}
            onFavorito={alFavorito}
            favoritos={favoritosCtx.ids}
          />
        ) : (
          <div className="grid grid-cols-2 gap-sm sm:gap-md lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-64 sm:h-72" />
            ))}
          </div>
        )}
      </section>

      {/* ── Cómo comprar ──────────────────────────────────────── */}
      <section className="bg-primary-container/10 px-margin-mobile py-lg md:px-gutter md:py-xl">
        <div className="mx-auto max-w-container-max">
          <div className="mb-lg text-center md:mb-xl">
            <h2 className="font-heading text-headline-sm text-on-surface md:text-headline-lg">
              ¿Cómo comprar?
            </h2>
            <p className="mx-auto max-w-md text-body-sm text-on-surface-variant md:text-body-md">
              Fácil, rápido y seguro. Directo desde nuestra tienda a tu WhatsApp.
            </p>
          </div>
          <div className="relative grid grid-cols-1 gap-lg md:grid-cols-3">
            <div className="absolute left-0 top-8 hidden h-px w-full bg-outline-variant md:block" />
            {PASOS.map((p) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: p.n * 0.12 }}
                className="relative flex flex-col items-center space-y-sm text-center md:space-y-md"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white font-heading text-headline-sm text-primary shadow-lg">
                  {p.n}
                </div>
                <h3 className="font-heading text-[17px] font-semibold md:text-headline-sm">{p.titulo}</h3>
                <p className="max-w-[260px] text-body-sm text-on-surface-variant md:text-body-md">
                  {p.texto}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Confianza ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-container-max px-margin-mobile py-lg md:px-gutter md:py-xl">
        <motion.div
          variants={contenedor}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-sm sm:gap-md md:grid-cols-3"
        >
          {CONFIANZA.map((c) => {
            const Icono = c.icono;
            return (
              <motion.div
                key={c.titulo}
                variants={aparece}
                whileHover={{ y: -4 }}
                className="flex items-start gap-md rounded-md bg-surface-container-high p-md md:rounded-lg md:p-lg"
              >
                <Icono size={34} className="shrink-0 text-primary" />
                <div>
                  <h4 className="font-heading text-[16px] font-semibold md:text-headline-sm">
                    {c.titulo}
                  </h4>
                  <p className="text-body-sm text-on-surface-variant">{c.texto}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </main>
  );
}
