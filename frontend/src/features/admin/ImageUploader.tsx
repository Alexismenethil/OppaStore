"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X, Link2 } from "lucide-react";
import { adminApi, ApiError } from "@/lib/api/admin";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  /** Alto del recuadro de vista previa. */
  alto?: string;
}

/**
 * Subida de una imagen a Cloudinary (RF43). Firma la subida en el servidor y
 * sube el archivo directo a Cloudinary. Si no está configurado (501), cae a
 * pegar una URL manual. Muestra vista previa y permite quitar la imagen.
 */
export function ImageUploader({ value, onChange, label = "Imagen", alto = "h-40" }: Props) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modoUrl, setModoUrl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function subir(file: File) {
    setSubiendo(true);
    setError(null);
    try {
      const firma = await adminApi.firmarSubida();
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", firma.apiKey);
      form.append("timestamp", String(firma.timestamp));
      form.append("folder", firma.folder);
      form.append("signature", firma.signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${firma.cloudName}/image/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Cloudinary rechazó la subida");
      const json = (await res.json()) as { secure_url?: string };
      if (!json.secure_url) throw new Error("Respuesta inesperada de Cloudinary");
      onChange(json.secure_url);
    } catch (e) {
      if (e instanceof ApiError && e.status === 501) {
        setModoUrl(true);
        setError("Cloudinary no está configurado. Pega la URL de la imagen.");
      } else {
        setError(e instanceof Error ? e.message : "No se pudo subir la imagen");
      }
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div>
      <div className="mb-xs flex items-center justify-between">
        <label className="font-body text-label-md text-on-surface-variant">{label}</label>
        <button
          type="button"
          onClick={() => setModoUrl((v) => !v)}
          className="flex items-center gap-xs rounded-full px-xs py-1 font-body text-label-md text-primary transition-colors hover:bg-primary-container/50"
        >
          <Link2 size={13} /> {modoUrl ? "Subir archivo" : "Pegar URL"}
        </button>
      </div>

      <div className={`relative overflow-hidden rounded-[1.15rem] border border-white/80 bg-surface-container-low shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ring-1 ring-outline-variant/40 ${alto}`}>
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Quitar imagen"
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-on-surface shadow-[0_10px_22px_rgba(31,56,41,0.14)] transition-all hover:-translate-y-0.5 hover:text-error active:scale-95"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-xs text-on-surface-variant transition-all duration-200 hover:bg-white/50 hover:text-primary active:scale-[0.99]"
          >
            {subiendo ? <Loader2 className="animate-spin" size={22} /> : <ImagePlus size={22} />}
            <span className="font-body text-label-md">{subiendo ? "Subiendo…" : "Subir imagen"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) subir(f);
          e.target.value = "";
        }}
      />

      {modoUrl && (
        <input
          type="url"
          placeholder="https://…"
          defaultValue={value ?? ""}
          onBlur={(e) => onChange(e.target.value.trim() || null)}
          className="mt-xs w-full rounded-[1rem] border border-outline-variant/70 bg-white px-sm py-2 font-body text-body-sm text-on-surface outline-none transition-all focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
        />
      )}

      {error && <p className="mt-xs font-body text-label-md text-error">{error}</p>}
    </div>
  );
}
