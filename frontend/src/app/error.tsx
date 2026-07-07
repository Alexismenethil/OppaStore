"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-container-max flex-col items-center justify-center px-margin-mobile text-center md:px-gutter">
      <div className="max-w-md rounded-lg border border-outline-variant/70 bg-white p-md shadow-xl">
        <h1 className="font-heading text-headline-sm text-on-surface">No pudimos cargar esta vista</h1>
        <p className="mt-sm text-body-md text-on-surface-variant">
          Intenta nuevamente. Si estabas cambiando de pagina, esto suele resolverse al recargar.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-md rounded-full bg-primary px-lg py-sm font-body text-label-lg text-on-primary transition-transform active:scale-95"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
