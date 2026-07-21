import { describe, it, expect, vi, afterEach } from "vitest";
import { leerJSON, guardarJSON } from "@/lib/storage";

/** Acceso seguro a localStorage (RB17, RNF09): nunca debe romper la UI. */
describe("lib/storage (RB17, RNF09)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("devuelve el valor por defecto si la clave no existe", () => {
    expect(leerJSON("inexistente", [])).toEqual([]);
    expect(leerJSON("inexistente", { a: 1 })).toEqual({ a: 1 });
  });

  it("hace round-trip de objetos y arreglos", () => {
    guardarJSON("clave", { ids: ["p1", "p2"], n: 3 });
    expect(leerJSON("clave", null)).toEqual({ ids: ["p1", "p2"], n: 3 });
  });

  it("distingue un valor guardado vacío del valor por defecto", () => {
    guardarJSON("clave", []);
    expect(leerJSON("clave", ["defecto"])).toEqual([]);
  });

  it("un JSON corrupto devuelve el valor por defecto y avisa en consola", () => {
    const aviso = vi.spyOn(console, "warn").mockImplementation(() => {});
    window.localStorage.setItem("clave", "{roto");
    expect(leerJSON("clave", { ok: true })).toEqual({ ok: true });
    expect(aviso).toHaveBeenCalledOnce();
  });

  it("guarda 'null' y lo relee como null, no como el valor por defecto", () => {
    guardarJSON("clave", null);
    expect(leerJSON<unknown>("clave", "defecto")).toBeNull();
  });

  it("si setItem falla (cuota llena) no lanza y solo avisa (RNF09)", () => {
    const aviso = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(window.localStorage.setItem).mockImplementationOnce(() => {
      throw new DOMException("QuotaExceededError");
    });

    expect(() => guardarJSON("clave", { grande: true })).not.toThrow();
    expect(aviso).toHaveBeenCalledOnce();
  });

  it("si getItem falla (modo privado) devuelve el valor por defecto (RNF09)", () => {
    const aviso = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(window.localStorage.getItem).mockImplementationOnce(() => {
      throw new DOMException("SecurityError");
    });

    expect(leerJSON("clave", "defecto")).toBe("defecto");
    expect(aviso).toHaveBeenCalledOnce();
  });
});
