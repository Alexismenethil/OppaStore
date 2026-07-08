"use client";

import { useState } from "react";
import { Loader2, ChevronDown, ShoppingBag, MapPin, User } from "lucide-react";
import { adminApi, type AdminPedido, type EstadoPedido } from "@/lib/api/admin";
import { useAsync } from "@/features/admin/useAsync";
import { Tarjeta } from "@/features/admin/ui";
import { useToast } from "@/components/ui/Toast";
import { formatearSoles } from "@/domain/money";

const ESTADOS: { value: EstadoPedido; label: string; clase: string }[] = [
  { value: "pendiente", label: "Pendiente", clase: "bg-tertiary-container text-on-tertiary-container" },
  { value: "coordinado", label: "Coordinado", clase: "bg-primary-container text-on-primary-container" },
  { value: "entregado", label: "Entregado", clase: "bg-secondary-container text-on-secondary-container" },
  { value: "cancelado", label: "Cancelado", clase: "bg-error-container text-on-error-container" },
];

const claseEstado = (e: EstadoPedido) => ESTADOS.find((x) => x.value === e)?.clase ?? "";

export default function AdminPedidos() {
  const { data, cargando, recargar } = useAsync(() => adminApi.pedidos());
  const { mostrar } = useToast();
  const [abierto, setAbierto] = useState<string | null>(null);

  async function cambiar(p: AdminPedido, estado: EstadoPedido) {
    try {
      await adminApi.cambiarEstadoPedido(p.id, estado);
      mostrar("exito", `Pedido marcado como ${estado}`);
      recargar();
    } catch (e) {
      mostrar("aviso", e instanceof Error ? e.message : "No se pudo actualizar");
    }
  }

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-heading text-headline-md text-on-surface">Pedidos</h1>
        <p className="font-body text-body-sm text-on-surface-variant">
          {data ? `${data.length} pedidos registrados` : "Cargando…"}
        </p>
      </div>

      {cargando ? (
        <div className="flex justify-center py-xl">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center gap-sm rounded-xl border border-dashed border-outline-variant py-xl text-on-surface-variant">
          <ShoppingBag size={26} />
          <p className="font-body text-body-sm">Aún no hay pedidos.</p>
        </div>
      ) : (
        <div className="space-y-md">
          {data!.map((p) => (
            <Tarjeta key={p.id} className="!overflow-hidden !p-0">
              <div className="flex flex-wrap items-center gap-md p-sm md:p-md">
                <div className="min-w-[160px] flex-1">
                  <p className="flex items-center gap-xs font-body text-body-sm font-medium text-on-surface">
                    <User size={14} className="text-on-surface-variant" /> {p.nombreCliente}
                  </p>
                  <p className="flex items-center gap-xs font-body text-label-md text-on-surface-variant">
                    <MapPin size={13} /> {p.distrito} · {p.metodoEntrega}
                  </p>
                  <p className="font-body text-label-md text-on-surface-variant">
                    {new Date(p.createdAt).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}
                    {p.usuario ? ` · ${p.usuario.email}` : " · invitado"}
                  </p>
                </div>

                <p className="font-heading text-headline-sm text-primary">{formatearSoles(Number(p.total))}</p>

                <div className="flex w-full flex-wrap items-center gap-sm sm:w-auto">
                  <span className={`rounded-full px-sm py-1 font-body text-label-md ${claseEstado(p.estado)}`}>
                    {ESTADOS.find((x) => x.value === p.estado)?.label}
                  </span>
                  <select
                    aria-label="Cambiar estado"
                    value={p.estado}
                    onChange={(e) => cambiar(p, e.target.value as EstadoPedido)}
                    className="min-h-10 rounded-full border border-outline-variant/60 bg-white px-sm py-1.5 font-body text-label-md text-on-surface shadow-sm outline-none transition-all focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                  >
                    {ESTADOS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setAbierto(abierto === p.id ? null : p.id)}
                    aria-label="Ver detalle"
                    aria-expanded={abierto === p.id}
                    className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface-variant shadow-sm transition-all hover:text-primary active:scale-95 sm:ml-0"
                  >
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${abierto === p.id ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {abierto === p.id && (
                <div className="border-t border-outline-variant/40 bg-surface-container-low/50 px-sm py-sm md:px-md">
                  <ul className="divide-y divide-outline-variant/40">
                    {p.items.map((it) => (
                      <li key={it.id} className="flex items-center justify-between gap-md py-1.5 font-body text-body-sm">
                        <span className="text-on-surface">
                          {it.cantidad}× {it.nombreProducto}
                        </span>
                        <span className="text-on-surface-variant">
                          {formatearSoles(Number(it.precioUnitario))} · {formatearSoles(Number(it.subtotal))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Tarjeta>
          ))}
        </div>
      )}
    </div>
  );
}
