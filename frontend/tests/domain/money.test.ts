import { describe, it, expect } from "vitest";
import { formatearSoles, redondear2 } from "@/domain/money";

describe("dinero (RB18)", () => {
  it("formatea con 2 decimales y prefijo S/", () => {
    expect(formatearSoles(173)).toBe("S/ 173.00");
    expect(formatearSoles(45.5)).toBe("S/ 45.50");
    expect(formatearSoles(0)).toBe("S/ 0.00");
  });

  it("redondea correctamente evitando errores de coma flotante", () => {
    expect(redondear2(0.1 + 0.2)).toBe(0.3);
    expect(redondear2(65.005)).toBe(65.01);
  });
});
