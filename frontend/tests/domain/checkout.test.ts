import { describe, it, expect } from "vitest";
import { validarDatosCliente, normalizarDatosCliente, METODOS_ENTREGA } from "@/domain/checkout";

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

describe("checkout · límites de validación (RF27, RB16)", () => {
  const baseRecojo = { metodoEntrega: "recojo" as const, distrito: "" };

  it("acepta un nombre de exactamente 2 caracteres y rechaza uno de 1", () => {
    expect(validarDatosCliente({ ...baseRecojo, nombre: "Ana" }).ok).toBe(true);
    expect(validarDatosCliente({ ...baseRecojo, nombre: "Jo" }).ok).toBe(true);
    expect(validarDatosCliente({ ...baseRecojo, nombre: "J" }).errores.nombre).toBeTruthy();
  });

  it("cuenta el nombre tras recortar espacios (' A ' es inválido)", () => {
    expect(validarDatosCliente({ ...baseRecojo, nombre: " A " }).errores.nombre).toBeTruthy();
    expect(validarDatosCliente({ ...baseRecojo, nombre: "  Ana  " }).ok).toBe(true);
  });

  it("rechaza un nombre ausente (undefined)", () => {
    expect(validarDatosCliente({ ...baseRecojo }).errores.nombre).toBeTruthy();
  });

  it("valida provincia y distrito sin distinguir tildes ni mayúsculas", () => {
    const r = validarDatosCliente({
      nombre: "Ana",
      provincia: "ancash", // sin tilde y en minúsculas ("Áncash")
      distrito: "HUARAZ",
      direccionEntrega: "Agencia Olva",
      metodoEntrega: "delivery",
    });
    expect(r.ok).toBe(true);
  });

  it("rechaza un distrito que existe pero pertenece a otra provincia", () => {
    const r = validarDatosCliente({
      nombre: "Ana",
      provincia: "Ayacucho",
      distrito: "Miraflores", // es de Lima
      direccionEntrega: "Agencia Shalom",
      metodoEntrega: "delivery",
    });
    expect(r.errores.provincia).toBeUndefined();
    expect(r.errores.distrito).toBeTruthy();
  });

  it("rechaza una dirección de delivery con solo espacios o de 1 carácter", () => {
    const base = {
      nombre: "Ana",
      provincia: "Lima",
      distrito: "Miraflores",
      metodoEntrega: "delivery" as const,
    };
    expect(validarDatosCliente({ ...base, direccionEntrega: "   " }).errores.direccionEntrega).toBeTruthy();
    expect(validarDatosCliente({ ...base, direccionEntrega: "A" }).errores.direccionEntrega).toBeTruthy();
    expect(validarDatosCliente({ ...base, direccionEntrega: "Av" }).ok).toBe(true);
  });

  it("en recojo ignora por completo provincia, distrito y dirección inválidos", () => {
    const r = validarDatosCliente({
      nombre: "Ana",
      provincia: "Atlantis",
      distrito: "Ciudad Perdida",
      direccionEntrega: "",
      metodoEntrega: "recojo",
    });
    expect(r.ok).toBe(true);
    expect(r.errores).toEqual({});
  });

  it("METODOS_ENTREGA declara exactamente los dos métodos soportados (RB12)", () => {
    expect(METODOS_ENTREGA).toEqual(["recojo", "delivery"]);
  });

  it("normaliza delivery con provincia y dirección ausentes a cadenas vacías", () => {
    expect(
      normalizarDatosCliente({
        nombre: " Ana ",
        distrito: " Miraflores ",
        metodoEntrega: "delivery",
      }),
    ).toEqual({
      nombre: "Ana",
      provincia: "",
      distrito: "Miraflores",
      direccionEntrega: "",
      metodoEntrega: "delivery",
    });
  });

  it("normalizar recojo descarta el destino aunque venga completo", () => {
    expect(
      normalizarDatosCliente({
        nombre: "Ana",
        provincia: "Lima",
        distrito: "Miraflores",
        direccionEntrega: "Av. Larco 123",
        metodoEntrega: "recojo",
      }),
    ).toEqual({
      nombre: "Ana",
      provincia: "",
      distrito: "Recojo en tienda",
      direccionEntrega: "",
      metodoEntrega: "recojo",
    });
  });
});
