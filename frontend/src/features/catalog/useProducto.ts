"use client";

import { useEffect, useState } from "react";
import type { Producto } from "@/domain/types";
import { fetchProducto } from "@/lib/api/products";
import { PRODUCTOS as SEED } from "@/data/products.seed";

type Estado =
  | { cargando: true; producto: null; noEncontrado: false }
  | { cargando: false; producto: Producto; noEncontrado: false }
  | { cargando: false; producto: null; noEncontrado: true };

const INICIAL: Estado = { cargando: true, producto: null, noEncontrado: false };

function enriquecerConSeed(producto: Producto | null, slug: string): Producto | null {
  if (!producto) return null;
  const respaldo = SEED.find((p) => p.slug === slug);
  if (!respaldo) return producto;
  return {
    ...producto,
    imagenUrl: producto.imagenUrl ?? respaldo.imagenUrl,
    imagenes: producto.imagenes?.length ? producto.imagenes : respaldo.imagenes,
  };
}

/**
 * Obtiene un producto por slug desde la API (RF18). Si el backend no responde,
 * usa el catálogo semilla como respaldo (RNF09). Marca `noEncontrado` cuando el
 * producto no existe en ninguna fuente o está inactivo (RB10).
 */
export function useProducto(slug: string): Estado {
  const [estado, setEstado] = useState<Estado>(INICIAL);

  useEffect(() => {
    let vigente = true;
    setEstado(INICIAL);

    const resolver = (p: Producto | null) => {
      if (!vigente) return;
      const producto = enriquecerConSeed(p, slug);
      setEstado(
        producto && producto.activo
          ? { cargando: false, producto, noEncontrado: false }
          : { cargando: false, producto: null, noEncontrado: true },
      );
    };

    fetchProducto(slug)
      .then(resolver)
      .catch(() => resolver(SEED.find((p) => p.slug === slug) ?? null));

    return () => {
      vigente = false;
    };
  }, [slug]);

  return estado;
}
