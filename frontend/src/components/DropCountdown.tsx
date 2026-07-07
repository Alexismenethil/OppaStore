"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Restante {
  dias: number;
  horas: number;
  mins: number;
}

function calcularRestante(fechaISO: string): Restante | null {
  const objetivo = new Date(`${fechaISO}T00:00:00`).getTime();
  const diff = objetivo - Date.now();
  if (Number.isNaN(objetivo) || diff <= 0) return null;
  return {
    dias: Math.floor(diff / 86_400_000),
    horas: Math.floor((diff % 86_400_000) / 3_600_000),
    mins: Math.floor((diff % 3_600_000) / 60_000),
  };
}

/** Cuenta regresiva hacia la llegada estimada de un drop (RF09, RB03). */
export function DropCountdown({ fechaISO }: { fechaISO: string }) {
  // Se calcula tras montar para evitar desajustes de hidratación.
  const [restante, setRestante] = useState<Restante | null>(null);

  useEffect(() => {
    setRestante(calcularRestante(fechaISO));
    const intervalo = setInterval(() => setRestante(calcularRestante(fechaISO)), 30_000);
    return () => clearInterval(intervalo);
  }, [fechaISO]);

  if (!restante) return null;

  const celdas = [
    { valor: restante.dias, etiqueta: "Días" },
    { valor: restante.horas, etiqueta: "Horas" },
    { valor: restante.mins, etiqueta: "Mins" },
  ];

  return (
    <div className="grid grid-cols-3 gap-sm sm:gap-md">
      {celdas.map((c) => (
        <div
          key={c.etiqueta}
          className="rounded-md bg-white p-sm text-center shadow-sm sm:p-md"
        >
          <motion.div
            key={c.valor}
            initial={{ y: -6, opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-heading text-headline-sm text-primary sm:text-headline-lg"
          >
            {String(c.valor).padStart(2, "0")}
          </motion.div>
          <div className="font-body text-label-md text-on-surface-variant">{c.etiqueta}</div>
        </div>
      ))}
    </div>
  );
}
