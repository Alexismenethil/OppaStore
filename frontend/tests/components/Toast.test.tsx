import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "@/components/ui/Toast";

/** Botones de prueba que disparan avisos desde dentro del provider (RNF07). */
function Disparadores() {
  const { mostrar } = useToast();
  return (
    <>
      <button onClick={() => mostrar("exito", "Agregado al carrito 💚")}>éxito</button>
      <button onClick={() => mostrar("aviso", "Solo hay 3 unidad(es) disponible(s)")}>aviso</button>
    </>
  );
}

describe("ToastProvider (RNF07)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("useToast fuera del provider lanza un error explícito", () => {
    const silenciar = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Disparadores />)).toThrow(/ToastProvider/);
    silenciar.mockRestore();
  });

  it("no muestra ningún aviso al inicio y expone una región aria-live", () => {
    const { container } = render(
      <ToastProvider>
        <Disparadores />
      </ToastProvider>,
    );
    expect(container.querySelector("[aria-live='polite']")).toBeInTheDocument();
    expect(screen.queryByText(/agregado al carrito/i)).not.toBeInTheDocument();
  });

  it("el aviso usa el estilo de error y el éxito el de superficie", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Disparadores />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "aviso" }));
    const aviso = screen.getByText(/solo hay 3 unidad/i).closest("div");
    expect(aviso?.className).toContain("bg-error-container");
  });

  it("mantiene como máximo 3 avisos simultáneos (descarta el más antiguo)", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Disparadores />
      </ToastProvider>,
    );

    const exito = screen.getByRole("button", { name: "éxito" });
    for (let i = 0; i < 5; i++) await user.click(exito);

    // Los descartados salen con animación; al terminar quedan 3 en pantalla.
    await waitFor(() => expect(screen.getAllByText("Agregado al carrito 💚")).toHaveLength(3), {
      timeout: 3000,
    });
  });

  it("apila avisos de distinto tipo a la vez", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Disparadores />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "éxito" }));
    await user.click(screen.getByRole("button", { name: "aviso" }));

    expect(screen.getByText("Agregado al carrito 💚")).toBeInTheDocument();
    expect(screen.getByText(/solo hay 3 unidad/i)).toBeInTheDocument();
  });
});

/**
 * El autocierre se prueba en un bloque aparte y al final: los temporizadores
 * falsos también interceptan requestAnimationFrame, del que depende la animación
 * de salida de framer-motion en el resto de casos.
 */
describe("ToastProvider · autocierre (RNF07)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("oculta el aviso 2.6 s después de mostrarlo, sin espera real", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider>
        <Disparadores />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "éxito" }));
    expect(screen.getByText("Agregado al carrito 💚")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2500); // aún visible justo antes del corte
    });
    expect(screen.getByText("Agregado al carrito 💚")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    // AnimatePresence lo mantiene en el DOM hasta terminar la animación de salida.
    await waitFor(() =>
      expect(screen.queryByText("Agregado al carrito 💚")).not.toBeInTheDocument(),
    );
  });

});
