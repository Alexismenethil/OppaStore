"use client";

import { useEffect, useState } from "react";
import type { Producto } from "@/domain/types";
import { fetchDestacados } from "@/lib/api/products";

/**
 * "Los más pedidos" del home: se calculan en el backend por unidades vendidas
 * (RF48). Devuelve lista vacía mientras carga o si la API cae, para que el home
 * pueda recurrir a su propio respaldo (RNF09).
 */
export function useDestacados(limit = 4): { destacados: Producto[]; cargando: boolean } {
  const [destacados, setDestacados] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;
    fetchDestacados(limit)
      .then((data) => {
        if (vigente) setDestacados(data);
      })
      .catch(() => {})
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [limit]);

  return { destacados, cargando };
}
