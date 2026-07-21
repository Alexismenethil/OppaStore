import "dotenv/config";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { createHash } from "node:crypto";
import { formatearSoles, redondear2 } from "../src/lib/money";
import { generarSlug } from "../src/lib/slug";
import { cloudinaryConfigurado, firmarSubida } from "../src/lib/cloudinary";
import { firmarToken, verificarToken } from "../src/lib/jwt";

/** Unitarias de las utilidades del servidor (sin base de datos). */

describe("lib/money — espejo de RB18 en el servidor", () => {
  it("redondea a céntimos evitando errores de coma flotante", () => {
    expect(redondear2(0.1 + 0.2)).toBe(0.3);
    expect(redondear2(2.675)).toBe(2.68);
    expect(redondear2(65.005)).toBe(65.01);
  });

  it("mantiene los enteros y el cero", () => {
    expect(redondear2(100)).toBe(100);
    expect(redondear2(0)).toBe(0);
  });

  it("formatea siempre con prefijo S/ y 2 decimales", () => {
    expect(formatearSoles(173)).toBe("S/ 173.00");
    expect(formatearSoles(45.5)).toBe("S/ 45.50");
    expect(formatearSoles(19.999)).toBe("S/ 20.00");
  });

  it("el total de una línea coincide con precio × cantidad redondeado", () => {
    expect(redondear2(0.1 * 3)).toBe(0.3);
    expect(formatearSoles(redondear2(39.9 * 2))).toBe("S/ 79.80");
  });
});

describe("lib/slug — slug URL-safe (RF43)", () => {
  it("pasa a minúsculas y une con guiones", () => {
    expect(generarSlug("Producto De Prueba QA")).toBe("producto-de-prueba-qa");
  });

  it("quita tildes y caracteres no alfanuméricos", () => {
    expect(generarSlug("Tónico Yujá & Niacin!")).toBe("tonico-yuja-niacin");
    expect(generarSlug("Serum 100% Centella")).toBe("serum-100-centella");
  });

  it("no deja guiones al inicio ni al final", () => {
    expect(generarSlug("  ¡Drop especial!  ")).toBe("drop-especial");
    expect(generarSlug("---hola---")).toBe("hola");
  });

  it("un nombre sin caracteres válidos produce cadena vacía", () => {
    expect(generarSlug("¿¡...!?")).toBe("");
    expect(generarSlug("")).toBe("");
  });

  it("recorta a 80 caracteres", () => {
    const largo = generarSlug("a".repeat(200));
    expect(largo).toHaveLength(80);
  });

  it("nombres distintos con la misma normalización colisionan (por eso la ruta añade sufijo)", () => {
    expect(generarSlug("Serum Glow")).toBe(generarSlug("serum   glow"));
  });
});

describe("lib/jwt — sesión opcional (RF38)", () => {
  const payload = { sub: "u-1", email: "a@b.pe", nombre: "Ana", esAdmin: false };

  it("firma y verifica un token conservando el payload", () => {
    const token = firmarToken(payload);
    expect(verificarToken(token)).toMatchObject(payload);
  });

  it("devuelve null con un token inválido o manipulado", () => {
    expect(verificarToken("no-es-un-token")).toBeNull();
    expect(verificarToken("")).toBeNull();
    expect(verificarToken(`${firmarToken(payload)}x`)).toBeNull();
  });

  it("conserva la marca de administrador", () => {
    const token = firmarToken({ ...payload, esAdmin: true });
    expect(verificarToken(token)?.esAdmin).toBe(true);
  });
});

describe("lib/cloudinary — firma de subida (RF43)", () => {
  const previas = {
    cloud: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER,
  };

  function restaurar(nombre: string, valor?: string) {
    if (valor === undefined) delete process.env[nombre];
    else process.env[nombre] = valor;
  }

  beforeEach(() => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    delete process.env.CLOUDINARY_FOLDER;
  });

  afterAll(() => {
    restaurar("CLOUDINARY_CLOUD_NAME", previas.cloud);
    restaurar("CLOUDINARY_API_KEY", previas.key);
    restaurar("CLOUDINARY_API_SECRET", previas.secret);
    restaurar("CLOUDINARY_FOLDER", previas.folder);
  });

  it("sin variables de entorno reporta que no está configurado", () => {
    expect(cloudinaryConfigurado()).toBe(false);
  });

  it("con las tres variables reporta que sí está configurado", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "123";
    process.env.CLOUDINARY_API_SECRET = "secreto";
    expect(cloudinaryConfigurado()).toBe(true);
  });

  it("si falta cualquiera de las tres, no está configurado", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "123";
    expect(cloudinaryConfigurado()).toBe(false);
  });

  it("genera la firma SHA-1 del algoritmo de Cloudinary y no expone el secreto", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "123";
    process.env.CLOUDINARY_API_SECRET = "secreto";
    process.env.CLOUDINARY_FOLDER = "oppastore-qa";

    const firma = firmarSubida(1_700_000_000);
    const esperada = createHash("sha1")
      .update("folder=oppastore-qa&timestamp=1700000000secreto")
      .digest("hex");

    expect(firma).toEqual({
      cloudName: "demo",
      apiKey: "123",
      timestamp: 1_700_000_000,
      folder: "oppastore-qa",
      signature: esperada,
    });
    expect(JSON.stringify(firma)).not.toContain("secreto");
  });

  it("usa la carpeta 'oppastore' por defecto", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "123";
    process.env.CLOUDINARY_API_SECRET = "secreto";
    expect(firmarSubida(1).folder).toBe("oppastore");
  });

  it("timestamps distintos producen firmas distintas", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "123";
    process.env.CLOUDINARY_API_SECRET = "secreto";
    expect(firmarSubida(1).signature).not.toBe(firmarSubida(2).signature);
  });
});
