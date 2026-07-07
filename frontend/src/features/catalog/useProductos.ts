"use client";

import { useEffect, useState } from "react";
import type { Producto } from "@/domain/types";
import { fetchProductos } from "@/lib/api/products";
import { PRODUCTOS as SEED } from "@/data/products.seed";

interface Estado {
  productos: Producto[];
  cargando: boolean;
  /** true si se está mostrando el catálogo semilla porque la API no respondió. */
  usandoRespaldo: boolean;
}

/**
 * Obtiene los productos activos desde la API. Si falla (backend caído),
 * usa el catálogo semilla como respaldo para no dejar la UI vacía (RNF09).
 */
export function useProductos(): Estado {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [usandoRespaldo, setUsandoRespaldo] = useState(false);

  useEffect(() => {
    let vigente = true;
    fetchProductos()
      .then((data) => {
        if (vigente) setProductos(data);
      })
      .catch(() => {
        if (!vigente) return;
        setProductos(SEED.filter((p) => p.activo));
        setUsandoRespaldo(true);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, []);

  return { productos, cargando, usandoRespaldo };
}
