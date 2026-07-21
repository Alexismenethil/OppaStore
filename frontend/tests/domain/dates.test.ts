import { describe, it, expect } from "vitest";
import { formatearFechaLarga } from "@/domain/dates";

describe("formato de fechas del dominio", () => {
  it("formatea una fecha ISO como 'D de <mes> de YYYY'", () => {
    expect(formatearFechaLarga("2027-03-01")).toBe("1 de marzo de 2027");
    expect(formatearFechaLarga("2026-08-30")).toBe("30 de agosto de 2026");
    expect(formatearFechaLarga("2026-12-25T10:00:00Z")).toBe("25 de diciembre de 2026");
  });

  it("devuelve la cadena original si no es una fecha ISO válida", () => {
    expect(formatearFechaLarga("no-es-fecha")).toBe("no-es-fecha");
    expect(formatearFechaLarga("2026-13-01")).toBe("2026-13-01");
  });
});

describe("formato de fechas · casos de borde", () => {
  it("acepta los límites válidos de mes y día", () => {
    expect(formatearFechaLarga("2026-01-01")).toBe("1 de enero de 2026");
    expect(formatearFechaLarga("2026-12-31")).toBe("31 de diciembre de 2026");
  });

  it("rechaza mes 00 y día 00 devolviendo la cadena original", () => {
    expect(formatearFechaLarga("2026-00-15")).toBe("2026-00-15");
    expect(formatearFechaLarga("2026-05-00")).toBe("2026-05-00");
  });

  it("rechaza días fuera de rango (32) devolviendo la cadena original", () => {
    expect(formatearFechaLarga("2026-05-32")).toBe("2026-05-32");
  });

  it("devuelve la cadena original con entradas vacías o incompletas", () => {
    expect(formatearFechaLarga("")).toBe("");
    expect(formatearFechaLarga("2026-05")).toBe("2026-05");
    expect(formatearFechaLarga("26-05-01")).toBe("26-05-01");
  });

  it("no aplica desfase de zona horaria al parsear un ISO con hora UTC", () => {
    // Un Date nativo con "T00:00:00Z" retrocedería un día en zonas UTC-5 (Perú).
    expect(formatearFechaLarga("2026-08-01T00:00:00Z")).toBe("1 de agosto de 2026");
  });

  it("quita los ceros a la izquierda del día", () => {
    expect(formatearFechaLarga("2026-09-05")).toBe("5 de septiembre de 2026");
  });
});
