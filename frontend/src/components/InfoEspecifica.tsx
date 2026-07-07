import type { ReactNode } from "react";
import { Droplets, Sparkles, TriangleAlert, CalendarClock, Nut, Truck } from "lucide-react";
import type { Producto } from "@/domain/types";
import { formatearFechaLarga } from "@/domain/dates";

interface Fila {
  clave: string;
  icono: ReactNode;
  etiqueta: string;
  valor: string;
}

/**
 * Información específica según el tipo de producto (RF19, RB13, RB14):
 *  - Skincare: tipo de piel, modo de uso, advertencia, vencimiento.
 *  - Snacks: vencimiento y alérgenos.
 *  - Drops/preventas: fecha estimada de llegada.
 * Solo se muestran los campos presentes; si no hay ninguno, no renderiza nada.
 */
export function InfoEspecifica({ producto }: { producto: Producto }) {
  const info = producto.infoAdicional ?? {};
  const filas: Fila[] = [];

  if (info.tipoPiel)
    filas.push({ clave: "tipoPiel", icono: <Droplets size={18} />, etiqueta: "Tipo de piel", valor: info.tipoPiel });
  if (info.modoUso)
    filas.push({ clave: "modoUso", icono: <Sparkles size={18} />, etiqueta: "Modo de uso", valor: info.modoUso });
  if (info.alergenos)
    filas.push({ clave: "alergenos", icono: <Nut size={18} />, etiqueta: "Alérgenos", valor: info.alergenos });
  if (info.advertencia)
    filas.push({ clave: "advertencia", icono: <TriangleAlert size={18} />, etiqueta: "Advertencia", valor: info.advertencia });
  if (producto.fechaVencimiento)
    filas.push({
      clave: "vencimiento",
      icono: <CalendarClock size={18} />,
      etiqueta: "Vence el",
      valor: formatearFechaLarga(producto.fechaVencimiento),
    });
  if (producto.esPreventa && producto.fechaEstimadaLlegada)
    filas.push({
      clave: "llegada",
      icono: <Truck size={18} />,
      etiqueta: "Llegada estimada",
      valor: formatearFechaLarga(producto.fechaEstimadaLlegada),
    });

  if (filas.length === 0) return null;

  return (
    <section aria-label="Detalles del producto" className="mt-lg rounded-lg bg-surface-container-low p-md sm:p-lg">
      <h2 className="mb-md font-heading text-headline-sm text-on-surface">Detalles del producto</h2>
      <dl className="space-y-md">
        {filas.map((f) => (
          <div key={f.clave} className="flex gap-sm">
            <span className="mt-[2px] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container/50 text-primary">
              {f.icono}
            </span>
            <div>
              <dt className="font-body text-label-md font-semibold text-on-surface">{f.etiqueta}</dt>
              <dd className="mt-[2px] text-body-sm text-on-surface-variant">{f.valor}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
