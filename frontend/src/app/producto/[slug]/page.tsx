"use client";

import { ProductoDetalle } from "@/features/catalog/ProductoDetalle";

/** Ruta de detalle de producto `/producto/[slug]` (RF18–RF21, HU10). */
export default function ProductoPage({ params }: { params: { slug: string } }) {
  return <ProductoDetalle slug={params.slug} />;
}
