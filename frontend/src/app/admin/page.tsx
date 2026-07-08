"use client";

import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  PackageX,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { useAsync } from "@/features/admin/useAsync";
import { Tarjeta } from "@/features/admin/ui";
import { formatearSoles } from "@/domain/money";

export default function AdminDashboard() {
  const { data, cargando } = useAsync(() => adminApi.summary());

  if (cargando || !data) {
    return (
      <div className="flex justify-center py-xl">
        <Loader2 className="animate-spin text-primary" size={26} />
      </div>
    );
  }

  const metricas = [
    { label: "Ventas (no canceladas)", valor: formatearSoles(data.ventas), icono: TrendingUp, tono: "text-primary" },
    { label: "Pedidos", valor: String(data.pedidos.total), extra: `${data.pedidos.pendientes} pendientes`, icono: ShoppingBag, tono: "text-tertiary" },
    { label: "Productos activos", valor: `${data.productos.activos}/${data.productos.total}`, icono: Package, tono: "text-secondary" },
    { label: "Usuarios", valor: String(data.usuarios), icono: Users, tono: "text-primary" },
  ];

  const alertas = [
    { label: "Stock bajo", valor: data.productos.stockBajo, icono: AlertTriangle, urgente: data.productos.stockBajo > 0 },
    { label: "Agotados", valor: data.productos.agotados, icono: PackageX, urgente: data.productos.agotados > 0 },
    { label: "Inactivos", valor: data.productos.inactivos, icono: Package, urgente: false },
  ];

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-heading text-headline-md text-on-surface">Tablero</h1>
        <p className="font-body text-body-sm text-on-surface-variant">Resumen de tu tienda OppaStore.</p>
      </div>

      <div className="grid grid-cols-2 gap-md lg:grid-cols-4">
        {metricas.map((m) => {
          const Icono = m.icono;
          return (
            <Tarjeta key={m.label} className="group min-h-[142px]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-variant shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-primary-container/70">
                <Icono className={m.tono} size={22} />
              </div>
              <p className="mt-sm font-heading text-headline-md text-on-surface">{m.valor}</p>
              <p className="font-body text-label-md text-on-surface-variant">{m.label}</p>
              {m.extra && <p className="mt-xs font-body text-label-md text-tertiary">{m.extra}</p>}
            </Tarjeta>
          );
        })}
      </div>

      <div className="grid gap-md sm:grid-cols-3">
        {alertas.map((a) => {
          const Icono = a.icono;
          return (
            <Tarjeta key={a.label} className={a.urgente ? "border-error/40" : ""}>
              <div className="flex items-center gap-sm">
                <Icono size={18} className={a.urgente ? "text-error" : "text-on-surface-variant"} />
                <span className="font-body text-body-sm text-on-surface">{a.label}</span>
                <span className={`ml-auto font-heading text-headline-sm ${a.urgente ? "text-error" : "text-on-surface"}`}>
                  {a.valor}
                </span>
              </div>
            </Tarjeta>
          );
        })}
      </div>

      <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/admin/productos/nuevo", label: "Añadir producto" },
          { href: "/admin/productos", label: "Gestionar catálogo" },
          { href: "/admin/pedidos", label: "Ver pedidos" },
          { href: "/admin/inicio", label: "Editar inicio" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group flex items-center justify-between rounded-[1.15rem] border border-white/80 bg-white/90 px-md py-md font-body text-label-lg text-on-surface shadow-[0_14px_34px_rgba(35,75,54,0.07)] ring-1 ring-outline-variant/40 transition-all duration-200 hover:-translate-y-0.5 hover:text-primary hover:shadow-[0_18px_42px_rgba(35,75,54,0.11)]"
          >
            {l.label}
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
