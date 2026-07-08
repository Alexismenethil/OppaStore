"use client";

import { Loader2, ShieldCheck, Users } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { useAsync } from "@/features/admin/useAsync";

export default function AdminUsuarios() {
  const { data, cargando } = useAsync(() => adminApi.usuarios());

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-heading text-headline-md text-on-surface">Usuarios</h1>
        <p className="font-body text-body-sm text-on-surface-variant">
          Cuentas registradas en la tienda y administradores que hayan iniciado sesión en el panel.
        </p>
      </div>

      {cargando ? (
        <div className="flex justify-center py-xl">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center gap-sm rounded-xl border border-dashed border-outline-variant py-xl text-on-surface-variant">
          <Users size={26} />
          <p className="font-body text-body-sm">Aún no hay usuarios registrados.</p>
        </div>
      ) : (
        <>
          <div className="space-y-sm md:hidden">
            {data!.map((u) => (
              <div
                key={u.id}
                className="rounded-[1.2rem] border border-white/80 bg-white/90 p-sm shadow-[0_14px_34px_rgba(35,75,54,0.08)] ring-1 ring-outline-variant/40"
              >
                <div className="flex items-center gap-sm">
                  {u.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container font-heading text-headline-sm text-on-primary-container shadow-sm">
                      {u.nombre.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-body-sm font-semibold text-on-surface">{u.nombre}</p>
                    <p className="truncate font-body text-label-md text-on-surface-variant">{u.email}</p>
                  </div>
                  {u.esAdmin ? (
                    <span className="inline-flex shrink-0 items-center gap-xs rounded-full bg-tertiary-container px-sm py-1 font-body text-label-md text-on-tertiary-container">
                      <ShieldCheck size={13} /> Admin
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-surface-container-high px-sm py-1 font-body text-label-md text-on-surface-variant">
                      Cliente
                    </span>
                  )}
                </div>
                <p className="mt-sm font-body text-label-md text-on-surface-variant">
                  Registrado el {new Date(u.createdAt).toLocaleDateString("es-PE", { dateStyle: "medium" })}
                </p>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-[1.2rem] border border-white/80 bg-white/90 shadow-[0_16px_40px_rgba(35,75,54,0.07)] ring-1 ring-outline-variant/40 md:block">
            <table className="w-full min-w-[560px] text-left">
            <thead className="border-b border-outline-variant/50 bg-surface-container-low/50 font-body text-label-md text-on-surface-variant">
              <tr>
                <th className="px-md py-sm">Usuario</th>
                <th className="px-md py-sm">Correo</th>
                <th className="px-md py-sm">Rol</th>
                <th className="px-md py-sm">Registrado</th>
              </tr>
            </thead>
            <tbody className="font-body text-body-sm">
              {data!.map((u) => (
                <tr key={u.id} className="border-b border-outline-variant/40 transition-colors hover:bg-surface-container-low/50 last:border-0">
                  <td className="px-md py-sm">
                    <div className="flex items-center gap-sm">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container font-heading text-label-md text-on-primary-container">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-on-surface">{u.nombre}</span>
                    </div>
                  </td>
                  <td className="px-md py-sm text-on-surface-variant">{u.email}</td>
                  <td className="px-md py-sm">
                    {u.esAdmin ? (
                      <span className="inline-flex items-center gap-xs rounded-full bg-tertiary-container px-sm py-0.5 text-label-md text-on-tertiary-container">
                        <ShieldCheck size={13} /> Admin
                      </span>
                    ) : (
                      <span className="text-on-surface-variant">Cliente</span>
                    )}
                  </td>
                  <td className="px-md py-sm text-on-surface-variant">
                    {new Date(u.createdAt).toLocaleDateString("es-PE", { dateStyle: "medium" })}
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
