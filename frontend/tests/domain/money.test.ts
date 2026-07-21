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

describe("dinero · casos de borde (RB18)", () => {
  it("mantiene los céntimos exactos en montos ya redondeados", () => {
    expect(redondear2(12.34)).toBe(12.34);
    expect(redondear2(0)).toBe(0);
  });

  it("redondea hacia arriba en el medio céntimo (2.675 → 2.68)", () => {
    // Sin la corrección con EPSILON, 2.675 se redondearía a 2.67 por coma flotante.
    expect(redondear2(2.675)).toBe(2.68);
    expect(redondear2(1.005)).toBe(1.01);
  });

  it("descarta los decimales por debajo del medio céntimo", () => {
    expect(redondear2(10.004)).toBe(10);
    expect(redondear2(10.994)).toBe(10.99);
  });

  it("formatea montos con más de 2 decimales al céntimo más cercano", () => {
    expect(formatearSoles(19.999)).toBe("S/ 20.00");
    expect(formatearSoles(0.001)).toBe("S/ 0.00");
  });

  it("formatea montos grandes sin notación científica ni separadores", () => {
    expect(formatearSoles(1234567.5)).toBe("S/ 1234567.50");
  });

  it("formatea montos negativos (útil para ajustes o descuentos futuros)", () => {
    expect(formatearSoles(-45.5)).toBe("S/ -45.50");
    // -0.005 redondea a -0; toFixed lo normaliza a "0.00" (nunca "-0.00").
    expect(formatearSoles(-0.005)).toBe("S/ 0.00");
  });
});
