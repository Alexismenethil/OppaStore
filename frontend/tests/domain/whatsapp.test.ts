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
    distrito: "Huamanga",
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

  it("CP09 · incluye nombre, distrito y método de entrega (RB16)", () => {
    expect(mensaje).toContain("Mi nombre: Ana");
    expect(mensaje).toContain("Mi distrito/zona: Huamanga");
    expect(mensaje).toContain("Método de entrega: delivery");
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
    expect(borrador).toContain("Mi distrito/zona: ");
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
