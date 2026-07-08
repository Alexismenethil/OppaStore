"use client";

import { Loader2 } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { useAsync } from "@/features/admin/useAsync";
import { ProductoForm } from "@/features/admin/ProductoForm";

export default function NuevoProducto() {
  const { data: categorias, cargando } = useAsync(() => adminApi.categorias());

  if (cargando || !categorias) {
    return (
      <div className="flex justify-center py-xl">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return <ProductoForm categorias={categorias} />;
}
