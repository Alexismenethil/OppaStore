import { Suspense } from "react";
import { CuentaView } from "@/features/auth/CuentaView";

/** Ruta de sesión opcional `/cuenta` (RF38, HU14). */
export default function CuentaPage() {
  return (
    <Suspense fallback={null}>
      <CuentaView />
    </Suspense>
  );
}
