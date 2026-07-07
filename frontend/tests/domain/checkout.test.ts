import { describe, it, expect } from "vitest";
import { validarDatosCliente, normalizarDatosCliente } from "@/domain/checkout";

describe("validación de datos del cliente (RF27, RB16)", () => {
  it("acepta datos completos", () => {
    const r = validarDatosCliente({
      nombre: "Ana",
      provincia: "Ayacucho",
      distrito: "Jesús Nazareno",
      direccionEntrega: "Agencia Shalom Ayacucho",
      metodoEntrega: "delivery",
    });
    expect(r.ok).toBe(true);
    expect(r.errores).toEqual({});
  });

  it("rechaza nombre vacío o demasiado corto", () => {
    expect(validarDatosCliente({ nombre: "A", distrito: "Huamanga", metodoEntrega: "recojo" }).errores.nombre).toBeTruthy();
    expect(validarDatosCliente({ nombre: "   ", distrito: "Huamanga", metodoEntrega: "recojo" }).errores.nombre).toBeTruthy();
  });

  it("acepta recojo en tienda sin distrito", () => {
    const r = validarDatosCliente({ nombre: "Ana", distrito: "", metodoEntrega: "recojo" });
    expect(r.ok).toBe(true);
    expect(r.errores.distrito).toBeUndefined();
  });

  it("rechaza destino nacional incompleto cuando el método es delivery", () => {
    const r = validarDatosCliente({ nombre: "Ana", distrito: "", metodoEntrega: "delivery" });
    expect(r.errores.provincia).toBeTruthy();
    expect(r.errores.distrito).toBeTruthy();
    expect(r.errores.direccionEntrega).toBeTruthy();
  });

  it("rechaza provincia o distrito fuera de la lista", () => {
    const r = validarDatosCliente({
      nombre: "Ana",
      provincia: "Atlantis",
      distrito: "Centro",
      direccionEntrega: "Agencia",
      metodoEntrega: "delivery",
    });
    expect(r.errores.provincia).toBeTruthy();
    expect(r.errores.distrito).toBeTruthy();
  });

  it("exige un método de entrega válido", () => {
    expect(validarDatosCliente({ nombre: "Ana", distrito: "Huamanga" }).errores.metodoEntrega).toBeTruthy();
    expect(
      // @ts-expect-error método inválido a propósito
      validarDatosCliente({ nombre: "Ana", distrito: "Huamanga", metodoEntrega: "envio" }).errores.metodoEntrega,
    ).toBeTruthy();
  });

  it("acumula todos los errores cuando faltan todos los campos", () => {
    const r = validarDatosCliente({});
    expect(r.ok).toBe(false);
    expect(Object.keys(r.errores)).toEqual(expect.arrayContaining(["nombre", "metodoEntrega"]));
    expect(r.errores.distrito).toBeUndefined();
  });

  it("normaliza recortando espacios", () => {
    expect(
      normalizarDatosCliente({
        nombre: "  Ana  ",
        provincia: " Ayacucho ",
        distrito: " Jesús Nazareno ",
        direccionEntrega: " Agencia Shalom ",
        metodoEntrega: "delivery",
      }),
    ).toEqual({
      nombre: "Ana",
      provincia: "Ayacucho",
      distrito: "Jesús Nazareno",
      direccionEntrega: "Agencia Shalom",
      metodoEntrega: "delivery",
    });
  });

  it("normaliza recojo usando una zona interna clara", () => {
    expect(normalizarDatosCliente({ nombre: "Ana", distrito: "", metodoEntrega: "recojo" })).toEqual({
      nombre: "Ana",
      provincia: "",
      distrito: "Recojo en tienda",
      direccionEntrega: "",
      metodoEntrega: "recojo",
    });
  });
});
