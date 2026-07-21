import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/StatusBadge";
import { producto } from "../domain/fixtures";

/**
 * Etiqueta de estado del catálogo (RF14). El texto viene del dominio (RB19) y el
 * color del design system; aquí se verifica que cada estado pinte su token.
 */
describe("StatusBadge (RF14, RB19)", () => {
  it("CP05 · stock 0 muestra 'Agotado' con el token neutro", () => {
    render(<StatusBadge producto={producto({ stock: 0 })} />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveTextContent("Agotado");
    expect(badge.className).toContain("bg-surface-container-highest");
  });

  it("CP11 · stock 1..5 muestra 'Pocas unidades' con el token de error", () => {
    render(<StatusBadge producto={producto({ stock: 5 })} />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveTextContent("Pocas unidades");
    expect(badge.className).toContain("bg-error-container");
  });

  it("stock > 5 muestra 'Disponible' con el token primario", () => {
    render(<StatusBadge producto={producto({ stock: 6 })} />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveTextContent("Disponible");
    expect(badge.className).toContain("bg-primary-container");
  });

  it("CP10 · la preventa prevalece sobre el stock y usa el token terciario (RB03)", () => {
    render(<StatusBadge producto={producto({ stock: 2, esPreventa: true })} />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveTextContent("Preventa");
    expect(badge.className).toContain("bg-tertiary-container");
  });

  it("una preventa agotada sigue mostrando 'Preventa' (precedencia RB19)", () => {
    render(<StatusBadge producto={producto({ stock: 0, esPreventa: true })} />);
    expect(screen.getByTestId("status-badge")).toHaveTextContent("Preventa");
  });
});
