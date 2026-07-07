"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle } from "lucide-react";

type TipoToast = "exito" | "aviso";

interface Toast {
  id: number;
  tipo: TipoToast;
  mensaje: string;
}

interface ToastContexto {
  mostrar: (tipo: TipoToast, mensaje: string) => void;
}

const Contexto = createContext<ToastContexto | null>(null);

export function useToast(): ToastContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}

const ICONOS: Record<TipoToast, React.ReactNode> = {
  exito: <CheckCircle2 size={18} className="shrink-0 text-primary" />,
  aviso: <AlertTriangle size={18} className="shrink-0 text-on-error-container" />,
};

/** Notificaciones flotantes con animación (validaciones claras — RNF07). */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const siguienteId = useRef(0);

  const mostrar = useCallback((tipo: TipoToast, mensaje: string) => {
    const id = siguienteId.current++;
    setToasts((prev) => [...prev.slice(-2), { id, tipo, mensaje }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <Contexto.Provider value={{ mostrar }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-sm px-gutter md:bottom-8 md:items-end"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className={`pointer-events-auto flex items-center gap-sm rounded-full py-sm pl-4 pr-5 shadow-lg backdrop-blur-md ${
                t.tipo === "exito"
                  ? "bg-surface-container-lowest/95 text-on-surface"
                  : "bg-error-container/95 text-on-error-container"
              }`}
            >
              {ICONOS[t.tipo]}
              <span className="font-body text-body-sm">{t.mensaje}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Contexto.Provider>
  );
}
