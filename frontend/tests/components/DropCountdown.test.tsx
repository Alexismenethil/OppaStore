import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { DropCountdown } from "@/components/DropCountdown";

/**
 * Cuenta regresiva del drop (RF09, RB03). Se usan temporizadores falsos para no
 * depender del reloj real ni esperar los 30 s del intervalo.
 * `AHORA` es hora local porque el componente parsea `${fecha}T00:00:00` (local).
 */
const AHORA = new Date(2026, 6, 21, 10, 0, 0); // 21/07/2026 10:00 local

function renderConReloj(fechaISO: string) {
  return render(<DropCountdown fechaISO={fechaISO} />);
}

describe("DropCountdown (RF09, RB03)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(AHORA);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("muestra días, horas y minutos restantes hasta la llegada estimada", () => {
    renderConReloj("2026-07-24"); // faltan 2 días y 14 horas
    expect(screen.getByText("Días")).toBeInTheDocument();
    expect(screen.getByText("Horas")).toBeInTheDocument();
    expect(screen.getByText("Mins")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument(); // días
    expect(screen.getByText("14")).toBeInTheDocument(); // horas
    expect(screen.getByText("00")).toBeInTheDocument(); // minutos
  });

  it("rellena con cero a la izquierda los valores de un solo dígito", () => {
    renderConReloj("2026-07-22"); // faltan 0 días y 14 horas
    const valores = screen.getAllByText(/^\d{2}$/).map((n) => n.textContent);
    expect(valores).toEqual(["00", "14", "00"]);
  });

  it("no renderiza nada cuando la fecha ya pasó (drop llegado)", () => {
    const { container } = renderConReloj("2026-07-20");
    expect(container).toBeEmptyDOMElement();
  });

  it("no renderiza nada cuando la fecha es exactamente ahora (diferencia 0)", () => {
    vi.setSystemTime(new Date(2026, 6, 24, 0, 0, 0));
    const { container } = renderConReloj("2026-07-24");
    expect(container).toBeEmptyDOMElement();
  });

  it("no renderiza nada con una fecha inválida (dato mal cargado)", () => {
    const { container } = renderConReloj("no-es-fecha");
    expect(container).toBeEmptyDOMElement();
  });

  it("actualiza los minutos al avanzar el intervalo de 30 s, sin espera real", () => {
    renderConReloj("2026-07-22");
    expect(screen.getAllByText(/^\d{2}$/).map((n) => n.textContent)).toEqual(["00", "14", "00"]);

    act(() => {
      vi.advanceTimersByTime(60_000); // dos ticks del intervalo
    });
    expect(screen.getAllByText(/^\d{2}$/).map((n) => n.textContent)).toEqual(["00", "13", "59"]);
  });

  it("desaparece en cuanto el intervalo detecta que la fecha ya llegó", () => {
    vi.setSystemTime(new Date(2026, 6, 23, 23, 59, 30));
    const { container } = renderConReloj("2026-07-24");
    expect(screen.getByText("Días")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("limpia el intervalo al desmontar (sin timers colgados)", () => {
    const limpiar = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = renderConReloj("2026-07-24");
    unmount();
    expect(limpiar).toHaveBeenCalled();
    limpiar.mockRestore();
  });
});
