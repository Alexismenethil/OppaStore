"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  fetchConfig,
  fetchCategorias,
  type SiteConfig,
  type CategoriaMedia,
} from "@/lib/api/config";
import { WHATSAPP_NUMERO } from "@/lib/config";
import { CATEGORIAS } from "@/data/products.seed";
import { MEDIA_CATEGORIAS, HERO_MEDIA } from "@/data/categorias.media";

/** Valores por defecto (mismos del diseño) usados como respaldo si la API cae (RNF09). */
const CONFIG_DEFECTO: SiteConfig = {
  heroFlatLayUrl: HERO_MEDIA.flatLay,
  heroPandaUrl: HERO_MEDIA.panda,
  heroPandaEtiqueta: "Novedad Kawaii",
  dropHomeProductoId: null,
  whatsapp: WHATSAPP_NUMERO || null,
  email: null,
  facebook: null,
  instagram: null,
  tiktok: null,
  direccion: "Ayacucho, Perú · Atención online",
};

const CATEGORIAS_DEFECTO: CategoriaMedia[] = CATEGORIAS.map((c, i) => ({
  slug: c.slug,
  nombre: c.nombre,
  imagenUrl: MEDIA_CATEGORIAS[c.slug]?.imagen ?? null,
  overlay: MEDIA_CATEGORIAS[c.slug]?.overlay ?? null,
  orden: i + 1,
}));

interface ConfigContexto {
  config: SiteConfig;
  categorias: CategoriaMedia[];
}

const Contexto = createContext<ConfigContexto>({
  config: CONFIG_DEFECTO,
  categorias: CATEGORIAS_DEFECTO,
});

export function useSiteConfig(): ConfigContexto {
  return useContext(Contexto);
}

/**
 * Provee el contenido editable del sitio (footer, hero, drop, fotos de categorías)
 * desde la API, con respaldo a los valores del diseño si el backend no responde.
 */
export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(CONFIG_DEFECTO);
  const [categorias, setCategorias] = useState<CategoriaMedia[]>(CATEGORIAS_DEFECTO);

  useEffect(() => {
    let vigente = true;
    fetchConfig()
      .then((c) => {
        if (vigente) setConfig({ ...CONFIG_DEFECTO, ...limpiar(c) });
      })
      .catch(() => {});
    fetchCategorias()
      .then((cats) => {
        if (vigente && cats.length) setCategorias(cats);
      })
      .catch(() => {});
    return () => {
      vigente = false;
    };
  }, []);

  return <Contexto.Provider value={{ config, categorias }}>{children}</Contexto.Provider>;
}

/** Descarta claves nulas para que los valores por defecto sigan aplicando. */
function limpiar(c: SiteConfig): Partial<SiteConfig> {
  const out: Partial<SiteConfig> = {};
  (Object.keys(c) as (keyof SiteConfig)[]).forEach((k) => {
    if (c[k] !== null && c[k] !== undefined && c[k] !== "") out[k] = c[k] as never;
  });
  return out;
}
