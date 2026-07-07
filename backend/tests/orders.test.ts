import "dotenv/config";
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";

/**
 * Pruebas de integración del registro de pedidos (RF28, RB22, CP20).
 * Requieren la base de datos levantada y sembrada (docker compose + prisma seed).
 * Verifican que el pedido se registra con estado "pendiente" y snapshot de precio
 * ANTES de generar el mensaje de WhatsApp. No hay pasarela de pagos (RB11).
 */
const app = crearApp();

interface ApiProducto {
  id: string;
  nombre: string;
  precio: string;
  stock: number;
}

describe("API — registro de pedidos (RF28, RB22, CP20)", () => {
  let producto: ApiProducto;

  beforeAll(async () => {
    const res = await request(app).get("/api/v1/products");
    expect(res.status).toBe(200);
    const disponible = (res.body as ApiProducto[]).find((p) => p.stock > 0);
    expect(disponible, "Se necesita al menos un producto con stock (¿corriste el seed?)").toBeTruthy();
    producto = disponible!;
  });

  it("CP20 · registra el pedido con estado 'pendiente' y snapshot de precio", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .send({
        nombre: "Ana Quispe",
        provincia: "Ayacucho",
        distrito: "Jesús Nazareno",
        direccionEntrega: "Agencia Shalom Ayacucho",
        metodoEntrega: "delivery",
        items: [{ productoId: producto.id, cantidad: 2 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.pedido.estado).toBe("pendiente");
    expect(res.body.pedido.distrito).toBe("Ayacucho / Jesús Nazareno");
    expect(res.body.pedido.items).toHaveLength(1);

    const linea = res.body.pedido.items[0];
    expect(linea.nombreProducto).toBe(producto.nombre); // snapshot de nombre (RB22)
    expect(Number(linea.precioUnitario)).toBe(Number(producto.precio)); // snapshot de precio
    expect(linea.cantidad).toBe(2);

    // El mensaje de WhatsApp incluye producto y datos del cliente (RB06, RB16).
    expect(res.body.mensaje).toContain(producto.nombre);
    expect(res.body.mensaje).toContain("Método de entrega: delivery nacional");
    expect(res.body.mensaje).toContain("Mi nombre: Ana Quispe");
    expect(res.body.mensaje).toContain("Provincia / ciudad: Ayacucho");
    expect(res.body.mensaje).toContain("Dirección o agencia: Agencia Shalom Ayacucho");
  });

  it("acepta recojo en tienda sin distrito", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .send({
        nombre: "Ana Quispe",
        metodoEntrega: "recojo",
        items: [{ productoId: producto.id, cantidad: 1 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.pedido.distrito).toBe("Recojo en tienda");
    expect(res.body.mensaje).toContain("Método de entrega: recojo");
    expect(res.body.mensaje).not.toContain("Provincia / ciudad:");
  });

  it("CP06 · rechaza cantidades que exceden el stock (RB01)", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .send({
        nombre: "Ana",
        distrito: "Huamanga",
        metodoEntrega: "recojo",
        items: [{ productoId: producto.id, cantidad: producto.stock + 100 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/stock/i);
  });

  it("rechaza un carrito vacío (validación Zod)", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .send({ nombre: "Ana", distrito: "Huamanga", metodoEntrega: "recojo", items: [] });

    expect(res.status).toBe(400);
  });

  it("rechaza datos del cliente incompletos (RB16)", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .send({ distrito: "Huamanga", metodoEntrega: "recojo", items: [{ productoId: producto.id, cantidad: 1 }] });

    expect(res.status).toBe(400);
  });
});
