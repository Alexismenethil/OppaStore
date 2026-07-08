"use client";

import type { ReactNode } from "react";

export const claseInput =
  "w-full rounded-[1rem] border border-outline-variant/70 bg-white px-sm py-2.5 font-body text-body-sm text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition-all duration-200 placeholder:text-on-surface-variant/60 focus:border-primary/60 focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60";

/** Campo etiquetado para los formularios del panel. */
export function Campo({
  label,
  children,
  requerido,
  hint,
}: {
  label: string;
  children: ReactNode;
  requerido?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-xs block font-body text-label-md text-on-surface-variant">
        {label}
        {requerido && <span className="text-error"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-xs block font-body text-label-md text-on-surface-variant/70">{hint}</span>}
    </label>
  );
}

/** Tarjeta contenedora del panel. */
export function Tarjeta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[1.25rem] border border-white/80 bg-white/90 p-md shadow-[0_18px_45px_rgba(35,75,54,0.07)] ring-1 ring-outline-variant/40 transition-all duration-200 md:p-lg ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

/** Interruptor accesible para banderas booleanas. */
export function Interruptor({
  label,
  checked,
  onChange,
  descripcion,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  descripcion?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-center justify-between gap-md rounded-[1rem] border border-outline-variant/50 bg-white px-sm py-3 text-left shadow-[0_8px_22px_rgba(31,56,41,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_14px_28px_rgba(31,56,41,0.08)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
    >
      <span>
        <span className="block font-body text-body-sm text-on-surface">{label}</span>
        {descripcion && (
          <span className="block font-body text-label-md text-on-surface-variant">{descripcion}</span>
        )}
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full p-0.5 transition-all duration-200 ${
          checked ? "bg-primary shadow-[0_8px_18px_rgba(45,111,66,0.25)]" : "bg-surface-dim"
        }`}
      >
        <span
          className={`block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 group-active:scale-95 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
