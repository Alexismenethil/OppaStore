import type { Producto } from "@/domain/types";
import { estadoProducto, etiquetaEstado } from "@/domain/productStatus";

/** Etiqueta de estado con el color del design system (RF14). */
export function StatusBadge({ producto }: { producto: Producto }) {
  const estado = estadoProducto(producto);
  const clases: Record<typeof estado, string> = {
    disponible: "bg-primary-container text-on-primary-container",
    pocas_unidades: "bg-error-container text-on-error-container",
    agotado: "bg-surface-container-highest text-on-surface-variant",
    preventa: "bg-tertiary-container text-on-tertiary-container",
  };
  return (
    <span
      data-testid="status-badge"
      className={`inline-block whitespace-nowrap rounded-full px-2 py-[3px] font-body text-[10px] font-medium sm:px-sm sm:py-xs sm:text-label-md ${clases[estado]}`}
    >
      {etiquetaEstado(producto)}
    </span>
  );
}
