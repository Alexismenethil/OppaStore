"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Loader2, PackageX } from "lucide-react";
import { adminApi, type AdminProducto } from "@/lib/api/admin";
import { useAsync } from "@/features/admin/useAsync";
import { Interruptor, claseInput } from "@/features/admin/ui";
import { useToast } from "@/components/ui/Toast";
import { formatearSoles } from "@/domain/money";

type Filtro = "todos" | "activos" | "inactivos";

export default function AdminProductos() {
  const { data, cargando, recargar } = useAsync(() => adminApi.productos());
  const { mostrar } = useToast();
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const productos = useMemo(() => {
    const lista = data ?? [];
    return lista.filter((p) => {
      const coincide = p.nombre.toLowerCase().includes(q.toLowerCase());
      const estado = filtro === "todos" || (filtro === "activos" ? p.activo : !p.activo);
      return coincide && estado;
    });
  }, [data, q, filtro]);

  async function alternarEstado(p: AdminProducto) {
    try {
      await adminApi.cambiarEstadoProducto(p.id, !p.activo);
      mostrar("exito", !p.activo ? "Producto activado" : "Producto desactivado");
      recargar();
    } catch (e) {
      mostrar("aviso", e instanceof Error ? e.message : "No se pudo cambiar el estado");
    }
  }

  async function borrar(p: AdminProducto) {
    if (!window.confirm(`¿Eliminar "${p.nombre}"? Si tiene pedidos, solo se desactivará.`)) return;
    try {
      const r = await adminApi.borrarProducto(p.id);
      mostrar("exito", r.eliminado === "fisico" ? "Producto eliminado" : "Tiene historial: se desactivó");
      recargar();
    } catch (e) {
      mostrar("aviso", e instanceof Error ? e.message : "No se pudo eliminar");
    }
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div>
          <h1 className="font-heading text-headline-md text-on-surface">Productos</h1>
          <p className="font-body text-body-sm text-on-surface-variant">
            {data ? `${data.length} en el catálogo` : "Cargando…"}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-xs rounded-full bg-primary px-lg py-2.5 font-body text-label-lg text-on-primary shadow-sm transition-all hover:shadow-md active:scale-95"
        >
          <Plus size={16} /> Nuevo producto
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className={`${claseInput} pl-9`}
            placeholder="Buscar por nombre…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-outline-variant/40">
          {(["todos", "activos", "inactivos"] as Filtro[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-full px-md py-1.5 font-body text-label-md capitalize transition-all duration-200 ${
                filtro === f ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-white hover:text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center py-xl">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : productos.length === 0 ? (
        <div className="flex flex-col items-center gap-sm rounded-xl border border-dashed border-outline-variant py-xl text-on-surface-variant">
          <PackageX size={26} />
          <p className="font-body text-body-sm">Sin productos que coincidan.</p>
        </div>
      ) : (
        <>
          <div className="space-y-sm md:hidden">
            {productos.map((p) => (
              <div
                key={p.id}
                className="rounded-[1.2rem] border border-white/80 bg-white/90 p-sm shadow-[0_14px_34px_rgba(35,75,54,0.08)] ring-1 ring-outline-variant/40"
              >
                <div className="flex gap-sm">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] bg-surface-container">
                    {p.imagenUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imagenUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-sm">
                      <div className="min-w-0">
                        <p className="truncate font-body text-body-sm font-semibold text-on-surface">{p.nombre}</p>
                        <p className="font-body text-label-md text-on-surface-variant">{p.categoria?.nombre ?? "Sin categoría"}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-sm py-0.5 font-body text-label-md ${
                          p.stock === 0
                            ? "bg-error-container text-on-error-container"
                            : p.stock <= 5
                              ? "bg-tertiary-container text-on-tertiary-container"
                              : "bg-primary-container text-on-primary-container"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </div>
                    <p className="mt-xs font-heading text-headline-sm text-primary">{formatearSoles(Number(p.precio))}</p>
                  </div>
                </div>
                <div className="mt-sm flex items-center justify-between gap-sm">
                  <div className="min-w-[132px] flex-1">
                    <Interruptor label={p.activo ? "Activo" : "Inactivo"} checked={p.activo} onChange={() => alternarEstado(p)} />
                  </div>
                  <div className="flex items-center gap-xs">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      aria-label="Editar"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface-variant shadow-sm transition-all hover:text-primary active:scale-95"
                    >
                      <Pencil size={17} />
                    </Link>
                    <button
                      onClick={() => borrar(p)}
                      aria-label="Eliminar"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface-variant shadow-sm transition-all hover:text-error active:scale-95"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-[1.2rem] border border-white/80 bg-white/90 shadow-[0_16px_40px_rgba(35,75,54,0.07)] ring-1 ring-outline-variant/40 md:block">
            <table className="w-full min-w-[720px] text-left">
            <thead className="border-b border-outline-variant/50 bg-surface-container-low/50 font-body text-label-md text-on-surface-variant">
              <tr>
                <th className="px-md py-sm">Producto</th>
                <th className="px-md py-sm">Categoría</th>
                <th className="px-md py-sm">Precio</th>
                <th className="px-md py-sm">Stock</th>
                <th className="px-md py-sm">Activo</th>
                <th className="px-md py-sm text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="font-body text-body-sm">
              {productos.map((p) => (
                <tr key={p.id} className="border-b border-outline-variant/40 transition-colors hover:bg-surface-container-low/50 last:border-0">
                  <td className="px-md py-sm">
                    <div className="flex items-center gap-sm">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-container">
                        {p.imagenUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imagenUrl} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <span className="font-medium text-on-surface">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="px-md py-sm text-on-surface-variant">{p.categoria?.nombre ?? "—"}</td>
                  <td className="px-md py-sm text-on-surface">{formatearSoles(Number(p.precio))}</td>
                  <td className="px-md py-sm">
                    <span
                      className={`rounded-full px-sm py-0.5 text-label-md ${
                        p.stock === 0
                          ? "bg-error-container text-on-error-container"
                          : p.stock <= 5
                            ? "bg-tertiary-container text-on-tertiary-container"
                            : "bg-primary-container text-on-primary-container"
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-md py-sm">
                    <div className="w-[190px]">
                      <Interruptor label={p.activo ? "Sí" : "No"} checked={p.activo} onChange={() => alternarEstado(p)} />
                    </div>
                  </td>
                  <td className="px-md py-sm">
                    <div className="flex items-center justify-end gap-xs">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        aria-label="Editar"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => borrar(p)}
                        aria-label="Eliminar"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
