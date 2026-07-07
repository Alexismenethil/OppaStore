"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Check, ChevronDown, MapPin, Send, Store, Truck, Loader2, User, type LucideIcon } from "lucide-react";
import type { DatosCliente, MetodoEntrega } from "@/domain/types";
import type { ErroresCliente } from "@/domain/checkout";
import { formatearSoles } from "@/domain/money";
import {
  PROVINCIAS_ENVIO,
  distritosDeProvincia,
  esProvinciaValida,
  filtrarOpciones,
} from "@/data/ubicaciones.envio";

interface Props {
  datos: Partial<DatosCliente>;
  errores: ErroresCliente;
  enviando: boolean;
  total: number;
  onCambiar: <K extends keyof DatosCliente>(campo: K, valor: DatosCliente[K]) => void;
  onEnviar: () => void;
}

const METODOS: { valor: MetodoEntrega; etiqueta: string; icono: typeof Store }[] = [
  { valor: "recojo", etiqueta: "Recojo en tienda", icono: Store },
  { valor: "delivery", etiqueta: "Delivery", icono: Truck },
];

/**
 * Formulario de datos del cliente (RF27, RB16). Recoge nombre, método de entrega
 * y destino nacional solo para delivery antes de registrar el pedido (RB22) y abrir WhatsApp (RB06).
 * No pide datos de pago: el pago se coordina por WhatsApp (RB11, RB12).
 */
export function CheckoutForm({ datos, errores, enviando, total, onCambiar, onEnviar }: Props) {
  const esDelivery = datos.metodoEntrega === "delivery";
  const distritosDisponibles = useMemo(() => distritosDeProvincia(datos.provincia), [datos.provincia]);
  const provinciaLista = esProvinciaValida(datos.provincia);

  const alEnviar = (e: FormEvent) => {
    e.preventDefault();
    onEnviar();
  };

  return (
    <form onSubmit={alEnviar} className="flex min-h-0 flex-1 flex-col" noValidate>
      <div className="flex-1 space-y-md overflow-y-auto pr-1">
        <div>
          <label htmlFor="cliente-nombre" className="mb-xs block font-body text-label-md text-on-surface">
            Tu nombre
          </label>
          <div className="relative">
            <User
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              id="cliente-nombre"
              type="text"
              autoComplete="name"
              value={datos.nombre ?? ""}
              onChange={(e) => onCambiar("nombre", e.target.value)}
              aria-invalid={Boolean(errores.nombre)}
              aria-describedby={errores.nombre ? "error-nombre" : undefined}
              placeholder="Ej. Ana Quispe"
              className="w-full rounded-full border border-outline-variant bg-surface-container-lowest py-sm pl-10 pr-4 font-body text-body-md text-on-surface outline-none transition-colors focus:border-primary aria-[invalid=true]:border-error"
            />
          </div>
          {errores.nombre && (
            <p id="error-nombre" className="mt-xs text-body-sm text-error">
              {errores.nombre}
            </p>
          )}
        </div>

        <div>
          <span className="mb-xs block font-body text-label-md text-on-surface">Método de entrega</span>
          <div
            role="radiogroup"
            aria-label="Método de entrega"
            className="grid grid-cols-2 gap-xs rounded-md bg-surface-container-low p-xs"
          >
            {METODOS.map(({ valor, etiqueta, icono: Icono }) => {
              const activo = datos.metodoEntrega === valor;
              return (
                <motion.button
                  key={valor}
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onCambiar("metodoEntrega", valor)}
                  className={`flex min-h-[4.75rem] flex-col items-center justify-center gap-xs rounded-md px-xs py-sm font-body transition ${
                    activo
                      ? "bg-white text-primary shadow-sm ring-1 ring-primary/10"
                      : "text-on-surface-variant hover:bg-white/60 hover:text-on-surface"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                      activo ? "bg-primary-container/45 text-primary" : "bg-white/70 text-on-surface-variant"
                    }`}
                  >
                    <Icono size={22} strokeWidth={1.9} />
                  </span>
                  <span className="text-center text-[12px] font-semibold leading-tight sm:text-[13px]">
                    {etiqueta}
                  </span>
                </motion.button>
              );
            })}
          </div>
          {errores.metodoEntrega && (
            <p className="mt-xs text-body-sm text-error">{errores.metodoEntrega}</p>
          )}
        </div>

        <AnimatePresence initial={false}>
          {esDelivery && (
            <motion.div
              key="envio-nacional"
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-md overflow-hidden"
            >
              <CampoSeleccion
                id="cliente-provincia"
                label="Provincia / ciudad"
                placeholder="Busca: Ayacucho, Lima, Cusco..."
                value={datos.provincia ?? ""}
                icono={MapPin}
                opciones={PROVINCIAS_ENVIO}
                error={errores.provincia}
                onCambiar={(valor) => onCambiar("provincia", valor)}
              />

              <CampoSeleccion
                id="cliente-distrito"
                label="Distrito"
                placeholder={provinciaLista ? "Selecciona tu distrito" : "Selecciona provincia primero"}
                value={datos.distrito ?? ""}
                icono={MapPin}
                opciones={distritosDisponibles}
                error={errores.distrito}
                disabled={!provinciaLista}
                onCambiar={(valor) => onCambiar("distrito", valor)}
              />

              <div>
                <label
                  htmlFor="cliente-direccion-entrega"
                  className="mb-xs block font-body text-label-md text-on-surface"
                >
                  Dirección o agencia de transporte
                </label>
                <div className="relative">
                  <Building2
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  />
                  <input
                    id="cliente-direccion-entrega"
                    type="text"
                    autoComplete="street-address"
                    value={datos.direccionEntrega ?? ""}
                    onChange={(e) => onCambiar("direccionEntrega", e.target.value)}
                    aria-invalid={Boolean(errores.direccionEntrega)}
                    aria-describedby={errores.direccionEntrega ? "error-direccion-entrega" : undefined}
                    placeholder="Ej. Agencia Shalom Ayacucho / Av. ..."
                    className="w-full rounded-full border border-outline-variant bg-surface-container-lowest py-sm pl-10 pr-4 font-body text-body-md text-on-surface outline-none transition-colors focus:border-primary aria-[invalid=true]:border-error"
                  />
                </div>
                {errores.direccionEntrega && (
                  <p id="error-direccion-entrega" className="mt-xs text-body-sm text-error">
                    {errores.direccionEntrega}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="rounded-md bg-primary-container/25 p-sm text-body-sm text-on-surface-variant">
          {esDelivery
            ? "Coordinaremos el pago y el envío nacional por agencia; trabajamos con opciones como Olva, Shalom u otra empresa disponible para tu destino."
            : "💬 Coordinaremos el pago (Yape / Plin / efectivo) y el recojo directamente por WhatsApp."}
        </p>
      </div>

      <div className="mt-md border-t border-outline-variant pt-md">
        <div className="mb-md flex items-baseline justify-between">
          <span className="font-heading text-headline-sm">Total</span>
          <span className="font-heading text-headline-sm text-primary" data-testid="total-checkout">
            {formatearSoles(total)}
          </span>
        </div>
        <motion.button
          type="submit"
          whileTap={enviando ? undefined : { scale: 0.97 }}
          disabled={enviando}
          className="flex w-full items-center justify-center gap-sm rounded-full bg-primary py-md font-body text-label-lg text-on-primary shadow-sm transition-shadow hover:shadow-lg disabled:opacity-70"
        >
          {enviando ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Registrando pedido…
            </>
          ) : (
            <>
              <Send size={17} />
              Enviar pedido por WhatsApp
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}

function CampoSeleccion({
  id,
  label,
  placeholder,
  value,
  opciones,
  icono: Icono,
  error,
  disabled = false,
  onCambiar,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  opciones: string[];
  icono: LucideIcon;
  error?: string;
  disabled?: boolean;
  onCambiar: (valor: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const opcionesFiltradas = useMemo(() => filtrarOpciones(opciones, value), [opciones, value]);
  const mostrarOpciones = abierto && !disabled;

  const seleccionar = (opcion: string) => {
    onCambiar(opcion);
    setAbierto(false);
    inputRef.current?.blur();
  };

  return (
    <div>
      <label htmlFor={id} className="mb-xs block font-body text-label-md text-on-surface">
        {label}
      </label>
      <div className="relative">
        <Icono
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          type="text"
          autoComplete="off"
          value={value}
          disabled={disabled}
          aria-expanded={mostrarOpciones}
          aria-controls={`${id}-opciones`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder={placeholder}
          onFocus={() => setAbierto(true)}
          onBlur={() => window.setTimeout(() => setAbierto(false), 120)}
          onChange={(e) => {
            onCambiar(e.target.value);
            setAbierto(true);
          }}
          className="w-full rounded-full border border-outline-variant bg-surface-container-lowest py-sm pl-10 pr-10 font-body text-body-md text-on-surface outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-error"
        />
        <ChevronDown
          size={16}
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition ${
            mostrarOpciones ? "rotate-180" : ""
          }`}
        />
      </div>

      <AnimatePresence>
        {mostrarOpciones && (
          <motion.div
            id={`${id}-opciones`}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="mt-xs max-h-40 overflow-y-auto rounded-md border border-outline-variant/50 bg-white p-xs shadow-lg"
          >
            {opcionesFiltradas.length > 0 ? (
              opcionesFiltradas.map((opcion) => {
                const activa = opcion === value;
                return (
                  <button
                    key={opcion}
                    type="button"
                    role="option"
                    aria-selected={activa}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => seleccionar(opcion)}
                    className={`flex w-full items-center justify-between rounded-[0.65rem] px-sm py-xs text-left font-body text-body-sm transition ${
                      activa ? "bg-primary-container/35 text-primary" : "text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <span>{opcion}</span>
                    {activa && <Check size={15} />}
                  </button>
                );
              })
            ) : (
              <p className="px-sm py-xs text-body-sm text-on-surface-variant">Sin resultados.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p id={`${id}-error`} className="mt-xs text-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
