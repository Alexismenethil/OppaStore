import { describe, it, expect } from "vitest";
import {
  construirMensaje,
  enlaceWhatsapp,
  normalizarNumero,
  detallePedido,
} from "@/domain/whatsapp";
import type { ItemCarrito } from "@/domain/types";
import { producto } from "./fixtures";

const items: ItemCarrito[] = [
  { producto: producto({ id: "a", nombre: "Tónico Yuja Niacin", precio: 65 }), cantidad: 1 },
  { producto: producto({ id: "b", nombre: "Peluche Panda Kawaii", precio: 45 }), cantidad: 2 },
  { producto: producto({ id: "c", nombre: "Snack coreano edición limitada", precio: 18 }), cantidad: 1 },
];

describe("mensaje de WhatsApp (RB06, RB16, RB18)", () => {
  const mensaje = construirMensaje(items, {
    nombre: "Ana",
    provincia: "Ayacucho",
    distrito: "Jesús Nazareno",
    direccionEntrega: "Agencia Shalom Ayacucho",
    metodoEntrega: "delivery",
  });

  it("CP09 · incluye cada producto con cantidad y precio", () => {
    expect(mensaje).toContain("1. Tónico Yuja Niacin - Cantidad: 1 - S/ 65.00");
    expect(mensaje).toContain("2. Peluche Panda Kawaii - Cantidad: 2 - S/ 45.00 c/u");
    expect(mensaje).toContain("3. Snack coreano edición limitada - Cantidad: 1 - S/ 18.00");
  });

  it("CP09 · incluye el total aproximado (RB18)", () => {
    expect(mensaje).toContain("Total aproximado: S/ 173.00");
  });

  it("CP09 · incluye nombre, destino nacional y método cuando es delivery (RB16)", () => {
    expect(mensaje).toContain("Mi nombre: Ana");
    expect(mensaje).toContain("Provincia / ciudad: Ayacucho");
    expect(mensaje).toContain("Distrito: Jesús Nazareno");
    expect(mensaje).toContain("Dirección o agencia: Agencia Shalom Ayacucho");
    expect(mensaje).toContain("Método de entrega: delivery nacional");
  });

  it("omite distrito cuando el método es recojo en tienda", () => {
    const recojo = construirMensaje(items, {
      nombre: "Ana",
      distrito: "Recojo en tienda",
      metodoEntrega: "recojo",
    });
    expect(recojo).toContain("Mi nombre: Ana");
    expect(recojo).toContain("Método de entrega: recojo");
    expect(recojo).not.toContain("Provincia / ciudad:");
    expect(recojo).not.toContain("Dirección o agencia:");
  });

  it("CP15 · genera un enlace wa.me con el texto codificado (RF29)", () => {
    const url = enlaceWhatsapp("+51 987 654 321", mensaje);
    expect(url.startsWith("https://wa.me/51987654321?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1])).toBe(mensaje);
  });

  it("normaliza el número a solo dígitos", () => {
    expect(normalizarNumero("+51 987-654-321")).toBe("51987654321");
  });

  it("sin datos del cliente deja los campos en blanco (mensaje borrador)", () => {
    const borrador = construirMensaje(items);
    expect(borrador).toContain("Mi nombre: ");
    expect(borrador).toContain("Provincia / ciudad: ");
    expect(borrador).toContain("Distrito: ");
    expect(borrador).toContain("Dirección o agencia: ");
    expect(borrador).toContain("Método de entrega: recojo / delivery");
    expect(borrador).toContain("Total aproximado: S/ 173.00");
  });

  it("CP20 · genera el detalle del pedido con snapshot de precio (RB22)", () => {
    const detalle = detallePedido(items);
    expect(detalle).toHaveLength(3);
    expect(detalle[1]).toMatchObject({
      productoId: "b",
      nombreProducto: "Peluche Panda Kawaii",
      precioUnitario: 45,
      cantidad: 2,
      subtotal: 90,
    });
  });
});

describe("mensaje de WhatsApp · casos de borde (RB06, RB18)", () => {
  it("un carrito vacío genera un mensaje sin líneas y total S/ 0.00", () => {
    const vacio = construirMensaje([]);
    expect(vacio).toContain("Hola OppaStore");
    expect(vacio).toContain("Total aproximado: S/ 0.00");
    expect(vacio).not.toMatch(/^1\. /m);
  });

  it("numera las líneas desde 1 y en el orden del carrito", () => {
    const mensaje = construirMensaje(items);
    const lineas = mensaje.split("\n").filter((l) => /^\d+\. /.test(l));
    expect(lineas).toHaveLength(3);
    expect(lineas[0].startsWith("1. ")).toBe(true);
    expect(lineas[2].startsWith("3. ")).toBe(true);
  });

  it("el sufijo 'c/u' solo aparece cuando la cantidad es mayor a 1", () => {
    const uno = construirMensaje([{ producto: producto({ nombre: "Snack", precio: 12 }), cantidad: 1 }]);
    const dos = construirMensaje([{ producto: producto({ nombre: "Snack", precio: 12 }), cantidad: 2 }]);
    expect(uno).toContain("1. Snack - Cantidad: 1 - S/ 12.00");
    expect(uno).not.toContain("c/u");
    expect(dos).toContain("1. Snack - Cantidad: 2 - S/ 12.00 c/u");
  });

  it("muestra el precio unitario, no el subtotal, y el total sí acumulado (RB18)", () => {
    const mensaje = construirMensaje([
      { producto: producto({ nombre: "Peluche", precio: 45 }), cantidad: 3 },
    ]);
    expect(mensaje).toContain("Cantidad: 3 - S/ 45.00 c/u");
    expect(mensaje).toContain("Total aproximado: S/ 135.00");
  });

  it("redondea el total a céntimos aunque los precios tengan más decimales", () => {
    const mensaje = construirMensaje([
      { producto: producto({ id: "a", precio: 0.1 }), cantidad: 3 },
      { producto: producto({ id: "b", precio: 0.2 }), cantidad: 1 },
    ]);
    expect(mensaje).toContain("Total aproximado: S/ 0.50");
  });

  it("con datos parciales de delivery deja en blanco solo lo que falta (RB16)", () => {
    const mensaje = construirMensaje(items, { nombre: "Ana", metodoEntrega: "delivery" });
    expect(mensaje).toContain("Mi nombre: Ana");
    expect(mensaje).toContain("Provincia / ciudad: ");
    expect(mensaje).toContain("Distrito: ");
    expect(mensaje).toContain("Dirección o agencia: ");
    expect(mensaje).toContain("Método de entrega: delivery nacional");
  });

  it("sin método de entrega usa el texto de borrador 'recojo / delivery'", () => {
    const mensaje = construirMensaje(items, { nombre: "Ana" });
    expect(mensaje).toContain("Método de entrega: recojo / delivery");
    // Al no ser "recojo" explícito, el borrador sí pide el destino.
    expect(mensaje).toContain("Provincia / ciudad: ");
  });
});

describe("normalización de número y enlace wa.me (RF29)", () => {
  it("quita paréntesis, guiones, espacios y el signo +", () => {
    expect(normalizarNumero("+51 (999) 888-777")).toBe("51999888777");
    expect(normalizarNumero("51.999.888.777")).toBe("51999888777");
  });

  it("un número sin dígitos se normaliza a cadena vacía", () => {
    expect(normalizarNumero("")).toBe("");
    expect(normalizarNumero("sin-numero")).toBe("");
  });

  it("codifica saltos de línea, emojis y símbolos del mensaje", () => {
    const url = enlaceWhatsapp("51999888777", "Hola 💚\nTotal: S/ 10.00 & envío");
    expect(url).not.toContain("\n");
    expect(url).toContain("%0A"); // salto de línea codificado
    expect(url).toContain("%26"); // "&" codificado, no rompe el query string
    expect(decodeURIComponent(url.split("text=")[1])).toBe("Hola 💚\nTotal: S/ 10.00 & envío");
  });

  it("el enlace de un mensaje vacío sigue siendo válido", () => {
    expect(enlaceWhatsapp("+51 999 888 777", "")).toBe("https://wa.me/51999888777?text=");
  });
});

describe("detalle del pedido · casos de borde (RB22)", () => {
  it("un carrito vacío genera un detalle vacío", () => {
    expect(detallePedido([])).toEqual([]);
  });

  it("el subtotal de cada línea se redondea a céntimos", () => {
    const detalle = detallePedido([{ producto: producto({ id: "a", precio: 0.1 }), cantidad: 3 }]);
    expect(detalle[0].subtotal).toBe(0.3);
  });

  it("la suma de los subtotales coincide con el total del mensaje", () => {
    const detalle = detallePedido(items);
    const suma = detalle.reduce((acc, l) => acc + l.subtotal, 0);
    expect(suma).toBe(173); // 65 + 90 + 18
  });
});
