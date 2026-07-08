"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { SiteConfig } from "@/lib/api/config";
import { useAsync } from "@/features/admin/useAsync";
import { Tarjeta, Campo, claseInput } from "@/features/admin/ui";
import { useToast } from "@/components/ui/Toast";

export default function AdminConfig() {
  const { data, cargando } = useAsync(() => adminApi.config());

  if (cargando || !data) {
    return (
      <div className="flex justify-center py-xl">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return <ConfigForm inicial={data} />;
}

function ConfigForm({ inicial }: { inicial: SiteConfig }) {
  const { mostrar } = useToast();
  const [c, setC] = useState<SiteConfig>(inicial);
  const [guardando, setGuardando] = useState(false);

  const set = (k: keyof SiteConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setC((prev) => ({ ...prev, [k]: e.target.value }));

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      await adminApi.editarConfig({
        whatsapp: c.whatsapp || null,
        email: c.email || null,
        facebook: c.facebook || null,
        instagram: c.instagram || null,
        tiktok: c.tiktok || null,
        direccion: c.direccion || null,
      });
      mostrar("exito", "Datos de contacto guardados 💚");
    } catch (err) {
      mostrar("aviso", err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="space-y-lg">
      <div className="flex items-center justify-between gap-md">
        <div>
          <h1 className="font-heading text-headline-md text-on-surface">Configuración</h1>
          <p className="font-body text-body-sm text-on-surface-variant">
            Contacto y redes que aparecen en el footer de la tienda.
          </p>
        </div>
        <button
          type="submit"
          disabled={guardando}
          className="flex items-center gap-xs rounded-full bg-primary px-lg py-2.5 font-body text-label-lg text-on-primary shadow-sm transition-all hover:shadow-md active:scale-95 disabled:opacity-60"
        >
          {guardando ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Guardar
        </button>
      </div>

      <Tarjeta className="grid gap-md sm:grid-cols-2">
        <Campo label="WhatsApp" hint="Solo dígitos con código de país (ej. 51987654321).">
          <input className={claseInput} value={c.whatsapp ?? ""} onChange={set("whatsapp")} placeholder="51999999999" />
        </Campo>
        <Campo label="Correo (Gmail)">
          <input className={claseInput} value={c.email ?? ""} onChange={set("email")} placeholder="hola@oppastore.pe" />
        </Campo>
        <Campo label="Facebook">
          <input className={claseInput} value={c.facebook ?? ""} onChange={set("facebook")} placeholder="https://facebook.com/…" />
        </Campo>
        <Campo label="Instagram">
          <input className={claseInput} value={c.instagram ?? ""} onChange={set("instagram")} placeholder="https://instagram.com/…" />
        </Campo>
        <Campo label="TikTok">
          <input className={claseInput} value={c.tiktok ?? ""} onChange={set("tiktok")} placeholder="https://tiktok.com/@…" />
        </Campo>
        <Campo label="Ubicación / dirección">
          <input className={claseInput} value={c.direccion ?? ""} onChange={set("direccion")} placeholder="Ayacucho, Perú · Atención online" />
        </Campo>
      </Tarjeta>
    </form>
  );
}
