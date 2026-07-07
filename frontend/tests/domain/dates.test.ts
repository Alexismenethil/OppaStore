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
