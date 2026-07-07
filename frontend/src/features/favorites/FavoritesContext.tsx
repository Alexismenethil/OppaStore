"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { alternarFavorito, esFavorito } from "@/domain/favorites";
import { leerJSON, guardarJSON } from "@/lib/storage";

const CLAVE_STORAGE = "oppastore.favoritos.v1";

interface FavoritesContexto {
  ids: string[];
  esFavorito: (productoId: string) => boolean;
  /** Alterna y devuelve `true` si quedó marcado como favorito. */
  alternar: (productoId: string) => boolean;
  totalFavoritos: number;
}

const Contexto = createContext<FavoritesContexto | null>(null);

export function useFavorites(): FavoritesContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useFavorites debe usarse dentro de <FavoritesProvider>");
  return ctx;
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    setIds(leerJSON<string[]>(CLAVE_STORAGE, []));
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (hidratado) guardarJSON(CLAVE_STORAGE, ids);
  }, [ids, hidratado]);

  const alternar = useCallback(
    (productoId: string): boolean => {
      const quedaraMarcado = !esFavorito(ids, productoId);
      setIds((prev) => alternarFavorito(prev, productoId)); // RB08: sin duplicados
      return quedaraMarcado;
    },
    [ids],
  );

  const valor = useMemo<FavoritesContexto>(
    () => ({
      ids,
      esFavorito: (productoId: string) => esFavorito(ids, productoId),
      alternar,
      totalFavoritos: ids.length,
    }),
    [ids, alternar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
