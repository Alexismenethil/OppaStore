"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import {
  adminApi,
  type AdminCategoria,
  type AdminProducto,
} from "@/lib/api/admin";
import type { SiteConfig } from "@/lib/api/config";
import { useAsync } from "@/features/admin/useAsync";
import { Tarjeta, Campo, claseInput } from "@/features/admin/ui";
import { ImageUploader } from "@/features/admin/ImageUploader";
import { useToast } from "@/components/ui/Toast";

const OVERLAYS = [
  { value: "from-surface-container-highest/80", label: "Neutro claro" },
  { value: "from-secondary-container/80", label: "Verde salvia" },
  { value: "from-tertiary-container/80", label: "Rosa" },
  { value: "from-surface-container-low/80", label: "Gris suave" },
  { value: "from-primary-container/80", label: "Verde menta" },
  { value: "from-secondary-fixed/80", label: "Verde fijo" },
  { value: "from-error-container/80", label: "Rojo suave" },
  { value: "from-surface/80", label: "Superficie" },
];

export default function AdminInicio() {
  const { data, cargando } = useAsync(() =>
    Promise.all([adminApi.categorias(), adminApi.config(), adminApi.productos()]),
  );

  if (cargando || !data) {
    return (
      <div className="flex justify-center py-xl">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  const [categorias, config, productos] = data;
  const drops = productos.filter((p) => p.tipo === "drop");

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-heading text-headline-md text-on-surface">Contenido del inicio</h1>
        <p className="font-body text-body-sm text-on-surface-variant">
          Fotos de las categorías, hero y el drop que se muestra en la portada.
        </p>
      </div>

      <HeroDropEditor config={config} drops={drops} />

      <div>
        <h2 className="mb-md font-heading text-headline-sm text-on-surface">Fotos por categoría</h2>
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((c) => (
            <CategoriaEditor key={c.slug} categoria={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroDropEditor({ config, drops }: { config: SiteConfig; drops: AdminProducto[] }) {
  const { mostrar } = useToast();
  const [flat, setFlat] = useState(config.heroFlatLayUrl);
  const [panda, setPanda] = useState(config.heroPandaUrl);
  const [etiqueta, setEtiqueta] = useState(config.heroPandaEtiqueta ?? "");
  const [dropId, setDropId] = useState(config.dropHomeProductoId ?? "");
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    try {
      await adminApi.editarConfig({
        heroFlatLayUrl: flat,
        heroPandaUrl: panda,
        heroPandaEtiqueta: etiqueta || null,
        dropHomeProductoId: dropId || null,
      });
      mostrar("exito", "Portada actualizada 💚");
    } catch (e) {
      mostrar("aviso", e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Tarjeta className="space-y-md">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-headline-sm text-on-surface">Hero y drop</h2>
        <button
          onClick={guardar}
          disabled={guardando}
          className="flex items-center gap-xs rounded-full bg-primary px-md py-2 font-body text-label-md text-on-primary transition-all hover:shadow-md active:scale-95 disabled:opacity-60"
        >
          {guardando ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />} Guardar
        </button>
      </div>
      <div className="grid gap-md sm:grid-cols-2">
        <ImageUploader value={flat} onChange={setFlat} label="Hero principal (flat lay)" />
        <ImageUploader value={panda} onChange={setPanda} label="Hero flotante (panda)" />
      </div>
      <div className="grid gap-md sm:grid-cols-2">
        <Campo label="Etiqueta del hero flotante">
          <input className={claseInput} value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} />
        </Campo>
        <Campo label="Drop en el inicio" hint="Qué drop se muestra en la portada.">
          <select className={claseInput} value={dropId} onChange={(e) => setDropId(e.target.value)}>
            <option value="">— Automático (primer drop en preventa) —</option>
            {drops.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </div>
    </Tarjeta>
  );
}

function CategoriaEditor({ categoria }: { categoria: AdminCategoria }) {
  const { mostrar } = useToast();
  const [imagenUrl, setImagenUrl] = useState(categoria.imagenUrl);
  const [overlay, setOverlay] = useState(categoria.overlay ?? OVERLAYS[0].value);
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    try {
      await adminApi.editarCategoria(categoria.slug, { imagenUrl, overlay });
      mostrar("exito", `${categoria.nombre} actualizada`);
    } catch (e) {
      mostrar("aviso", e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Tarjeta className="space-y-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-body-lg font-semibold text-on-surface">{categoria.nombre}</h3>
      </div>
      <ImageUploader value={imagenUrl} onChange={setImagenUrl} label="Foto" alto="h-32" />
      <Campo label="Tono del overlay">
        <select className={claseInput} value={overlay} onChange={(e) => setOverlay(e.target.value)}>
          {OVERLAYS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Campo>
      <button
        onClick={guardar}
        disabled={guardando}
        className="flex w-full items-center justify-center gap-xs rounded-full border border-primary py-2 font-body text-label-md text-primary transition-colors hover:bg-primary-container active:scale-95 disabled:opacity-60"
      >
        {guardando ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />} Guardar
      </button>
    </Tarjeta>
  );
}
