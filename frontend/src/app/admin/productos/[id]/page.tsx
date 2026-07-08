"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { useAsync } from "@/features/admin/useAsync";
import { ProductoForm } from "@/features/admin/ProductoForm";

export default function EditarProducto({ params }: { params: { id: string } }) {
  const { data, cargando } = useAsync(() =>
    Promise.all([adminApi.productos(), adminApi.categorias()]),
  );

  if (cargando || !data) {
    return (
      <div className="flex justify-center py-xl">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  const [productos, categorias] = data;
  const producto = productos.find((p) => p.id === params.id);

  if (!producto) {
    return (
      <div className="py-xl text-center">
        <p className="font-body text-body-md text-on-surface-variant">Producto no encontrado.</p>
        <Link href="/admin/productos" className="mt-sm inline-block font-body text-label-lg text-primary hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return <ProductoForm producto={producto} categorias={categorias} />;
}
