"use client";

import { useEffect, useState } from "react";

interface Estado<T> {
  data: T | null;
  cargando: boolean;
  error: string | null;
  recargar: () => void;
}

/** Hook genérico para cargar datos del panel con estado de carga/error y recarga. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): Estado<T> {
  const [data, setData] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    fn()
      .then((d) => {
        if (vivo) {
          setData(d);
          setError(null);
        }
      })
      .catch((e) => {
        if (vivo) setError(e instanceof Error ? e.message : "Error al cargar");
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  return { data, cargando, error, recargar: () => setTick((t) => t + 1) };
}
