"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTOS, CATEGORIAS } from "@/data/products.seed";
import type { ItemCarrito, Producto } from "@/domain/types";
import { agregarAlCarrito, contarItems } from "@/domain/cart";
import { alternarFavorito } from "@/domain/favorites";

const PASOS = [
  { n: 1, titulo: "Elige tus favoritos", texto: "Navega por el catálogo y selecciona lo que más te guste." },
  { n: 2, titulo: "Revisa tu carrito", texto: "Asegúrate de tener todo antes de finalizar tu pedido." },
  { n: 3, titulo: "Pide por WhatsApp", texto: "Coordinamos el pago (Yape/Plin/Efectivo) y la entrega." },
];

export default function HomePage() {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);

  // Solo productos activos en el catálogo público (RB10).
  const activos = PRODUCTOS.filter((p) => p.activo);
  const destacados = activos.filter((p) => p.destacado);

  const agregar = (p: Producto) => setItems((prev) => agregarAlCarrito(prev, p, 1));
  const favorito = (p: Producto) => setFavoritos((prev) => alternarFavorito(prev, p.id));

  return (
    <>
      <Header itemsCarrito={contarItems(items)} />

      <main className="mt-20">
        {/* Hero */}
        <section className="relative flex min-h-[80vh] items-center overflow-hidden px-gutter">
          <div className="animate-float absolute -right-20 -top-20 -z-10 h-[500px] w-[500px] organic-shape-1 bg-primary-container/20" />
          <div className="animate-float absolute -left-20 top-1/2 -z-10 h-[360px] w-[360px] organic-shape-2 bg-secondary-container/30" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-container-max space-y-lg py-xl text-center lg:text-left"
          >
            <div className="flex justify-center gap-sm lg:justify-start">
              <span className="rounded-full bg-tertiary-container px-md py-xs font-body text-label-md text-on-tertiary-container">
                Stock limitado
              </span>
              <span className="rounded-full bg-primary-container px-md py-xs font-body text-label-md text-on-primary-container">
                Productos virales
              </span>
            </div>
            <h1 className="font-heading text-headline-lg leading-tight text-on-surface lg:text-display-lg">
              Tendencias asiáticas que llegan a <span className="italic text-primary">Ayacucho</span>
            </h1>
            <p className="mx-auto max-w-xl text-body-lg text-on-surface-variant lg:mx-0">
              Descubre la cosmética coreana y la ternura de los productos kawaii. Curados para ti,
              directo a tu WhatsApp.
            </p>
            <div className="flex flex-col justify-center gap-md sm:flex-row lg:justify-start">
              <button className="rounded-full bg-primary px-xl py-md font-body text-label-lg text-on-primary transition-all hover:shadow-lg active:scale-95">
                Ver productos
              </button>
              <button className="flex items-center justify-center gap-sm rounded-full border-2 border-primary px-xl py-md font-body text-label-lg text-primary transition-all hover:bg-primary-container">
                <MessageCircle size={18} /> Comprar por WhatsApp
              </button>
            </div>
          </motion.div>
        </section>

        {/* Categorías */}
        <section className="mx-auto max-w-container-max px-gutter py-xl">
          <h2 className="mb-lg font-heading text-headline-lg text-on-surface">Explora por Categorías</h2>
          <div className="grid grid-cols-2 gap-md sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIAS.map((c) => (
              <div
                key={c.slug}
                className="flex cursor-pointer flex-col items-center gap-sm rounded-md bg-surface-container-lowest p-md text-center shadow-sm transition-transform hover:-translate-y-1"
              >
                <div className="h-16 w-16 rounded-full bg-primary-container/60" />
                <span className="font-body text-label-lg text-on-surface">{c.nombre}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Destacados */}
        <section className="mx-auto max-w-container-max px-gutter py-xl">
          <div className="mb-lg">
            <h2 className="font-heading text-headline-lg text-on-surface">Los más pedidos</h2>
            <p className="mt-xs text-body-md text-on-surface-variant">Favoritos de la comunidad OppaStore</p>
          </div>
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
            {destacados.map((p) => (
              <ProductCard
                key={p.id}
                producto={p}
                onAgregar={agregar}
                onFavorito={favorito}
                esFavorito={favoritos.includes(p.id)}
              />
            ))}
          </div>
        </section>

        {/* Cómo comprar */}
        <section className="bg-primary-container/10 px-gutter py-xl">
          <div className="mx-auto max-w-container-max">
            <div className="mb-xl text-center">
              <h2 className="font-heading text-headline-lg text-on-surface">¿Cómo comprar?</h2>
              <p className="mx-auto max-w-md text-body-md text-on-surface-variant">
                Fácil, rápido y seguro. Directo desde nuestra tienda a tu WhatsApp.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
              {PASOS.map((p) => (
                <div key={p.n} className="flex flex-col items-center space-y-md text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white font-heading text-headline-sm text-primary shadow-lg">
                    {p.n}
                  </div>
                  <h3 className="font-heading text-headline-sm">{p.titulo}</h3>
                  <p className="text-body-md text-on-surface-variant">{p.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
