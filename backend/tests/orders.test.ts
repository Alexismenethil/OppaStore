import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import { borrarPedidos, borrarProducto, crearProducto, prisma } from "./helpers";

/**
 * Pruebas de integración del registro de pedidos (RF28, RB22, CP20).
 * Requieren la base de datos levantada y sembrada (docker compose + prisma seed).
 * Verifican que el pedido se registra con estado "pendiente" y snapshot de precio
 * ANTES de generar el mensaje de WhatsApp. No hay pasarela de pagos (RB11).
 *
 * La suite usa su propio producto (`qa-test-pedidos`) y borra los pedidos que
 * crea, para no alterar el historial ni el cálculo de "los más pedidos".
 */
const app = crearApp();

describe("API — registro de pedidos (RF28, RB22, CP20)", () => {
  const pedidosCreados: string[] = [];
  let productoId: string;
  let nombreProducto: string;
  let precio: number;
  const STOCK = 20;

  /** Registra un pedido y recuerda su id para limpiarlo al final. */
  async function postPedido(body: Record<string, unknown>) {
    const res = await request(app).post("/api/v1/orders").send(body);
    if (res.status === 201) pedidosCreados.push(res.body.pedido.id);
    return res;
  }

  beforeAll(async () => {
    const p = await crearProducto("pedidos", {
      nombre: "Tónico QA Pedidos",
      precio: 65,
      stock: STOCK,
    });
    productoId = p.id;
    nombreProducto = p.nombre;
    precio = Number(p.precio);
  });

  afterAll(async () => {
    await borrarPedidos(pedidosCreados);
    await borrarProducto(productoId);
  });

  // ── Camino feliz ──────────────────────────────────────────────────────────
  it("CP20 · registra el pedido con estado 'pendiente' y snapshot de precio", async () => {
    const res = await postPedido({
      nombre: "Ana Quispe",
      provincia: "Ayacucho",
      distrito: "Jesús Nazareno",
      direccionEntrega: "Agencia Shalom Ayacucho",
      metodoEntrega: "delivery",
      items: [{ productoId, cantidad: 2 }],
    });

    expect(res.status).toBe(201);
    expect(res.body.pedido.estado).toBe("pendiente");
    expect(res.body.pedido.distrito).toBe("Ayacucho / Jesús Nazareno");
    expect(res.body.pedido.items).toHaveLength(1);

    const linea = res.body.pedido.items[0];
    expect(linea.nombreProducto).toBe(nombreProducto); // snapshot de nombre (RB22)
    expect(Number(linea.precioUnitario)).toBe(precio); // snapshot de precio
    expect(linea.cantidad).toBe(2);
    expect(Number(linea.subtotal)).toBe(precio * 2);
    expect(Number(res.body.pedido.total)).toBe(precio * 2);

    // El mensaje de WhatsApp incluye producto y datos del cliente (RB06, RB16).
    expect(res.body.mensaje).toContain(nombreProducto);
    expect(res.body.mensaje).toContain("Método de entrega: delivery nacional");
    expect(res.body.mensaje).toContain("Mi nombre: Ana Quispe");
    expect(res.body.mensaje).toContain("Provincia / ciudad: Ayacucho");
    expect(res.body.mensaje).toContain("Dirección o agencia: Agencia Shalom Ayacucho");
  });

  it("acepta recojo en tienda sin distrito", async () => {
    const res = await postPedido({
      nombre: "Ana Quispe",
      metodoEntrega: "recojo",
      items: [{ productoId, cantidad: 1 }],
    });

    expect(res.status).toBe(201);
    expect(res.body.pedido.distrito).toBe("Recojo en tienda");
    expect(res.body.mensaje).toContain("Método de entrega: recojo");
    expect(res.body.mensaje).not.toContain("Provincia / ciudad:");
  });

  it("RB18 · el mensaje usa el formato S/ y marca 'c/u' solo con cantidad > 1", async () => {
    const uno = await postPedido({
      nombre: "Ana",
      metodoEntrega: "recojo",
      items: [{ productoId, cantidad: 1 }],
    });
    expect(uno.body.mensaje).toContain(`1. ${nombreProducto} - Cantidad: 1 - S/ 65.00`);
    expect(uno.body.mensaje).not.toContain("c/u");
    expect(uno.body.mensaje).toContain("Total aproximado: S/ 65.00");

    const varios = await postPedido({
      nombre: "Ana",
      metodoEntrega: "recojo",
      items: [{ productoId, cantidad: 3 }],
    });
    expect(varios.body.mensaje).toContain("Cantidad: 3 - S/ 65.00 c/u");
    expect(varios.body.mensaje).toContain("Total aproximado: S/ 195.00");
  });

  it("recorta los espacios del nombre y del destino antes de guardar", async () => {
    const res = await postPedido({
      nombre: "  Ana Quispe  ",
      provincia: " Lima ",
      distrito: " Miraflores ",
      direccionEntrega: "  Av. Larco 123  ",
      metodoEntrega: "delivery",
      items: [{ productoId, cantidad: 1 }],
    });
    expect(res.status).toBe(201);
    expect(res.body.pedido.nombreCliente).toBe("Ana Quispe");
    expect(res.body.pedido.distrito).toBe("Lima / Miraflores");
  });

  it("RB22 · el pedido queda realmente persistido con sus líneas", async () => {
    const res = await postPedido({
      nombre: "Ana Persistida",
      metodoEntrega: "recojo",
      items: [{ productoId, cantidad: 2 }],
    });

    const guardado = await prisma.pedido.findUnique({
      where: { id: res.body.pedido.id },
      include: { items: true },
    });
    expect(guardado?.estado).toBe("pendiente");
    expect(guardado?.items).toHaveLength(1);
    expect(Number(guardado?.total)).toBe(precio * 2);
  });

  // ── Validaciones (400) ────────────────────────────────────────────────────
  it("CP06 · rechaza cantidades que exceden el stock (RB01)", async () => {
    const res = await postPedido({
      nombre: "Ana",
      distrito: "Huamanga",
      metodoEntrega: "recojo",
      items: [{ productoId, cantidad: STOCK + 100 }],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/stock/i);
  });

  it("acepta exactamente el stock disponible (límite superior, RB01)", async () => {
    const limite = await crearProducto("pedidos-limite", { stock: 3, precio: 10 });
    try {
      const res = await postPedido({
        nombre: "Ana",
        metodoEntrega: "recojo",
        items: [{ productoId: limite.id, cantidad: 3 }],
      });
      expect(res.status).toBe(201);
      expect(res.body.pedido.items[0].cantidad).toBe(3);
    } finally {
      await borrarProducto(limite.id);
    }
  });

  it("rechaza un producto inactivo o inexistente con 400", async () => {
    const inactivo = await crearProducto("pedidos-inactivo", { activo: false });
    try {
      const res = await postPedido({
        nombre: "Ana",
        metodoEntrega: "recojo",
        items: [{ productoId: inactivo.id, cantidad: 1 }],
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/no disponible/i);
    } finally {
      await borrarProducto(inactivo.id);
    }

    const fantasma = await postPedido({
      nombre: "Ana",
      metodoEntrega: "recojo",
      items: [{ productoId: "producto-que-no-existe", cantidad: 1 }],
    });
    expect(fantasma.status).toBe(400);
  });

  it("rechaza un carrito vacío (validación Zod)", async () => {
    const res = await postPedido({
      nombre: "Ana",
      distrito: "Huamanga",
      metodoEntrega: "recojo",
      items: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Datos inválidos");
  });

  it("rechaza datos del cliente incompletos (RB16)", async () => {
    const res = await postPedido({
      distrito: "Huamanga",
      metodoEntrega: "recojo",
      items: [{ productoId, cantidad: 1 }],
    });

    expect(res.status).toBe(400);
  });

  it("RB16 · en delivery exige provincia, distrito y dirección", async () => {
    const res = await postPedido({
      nombre: "Ana",
      metodoEntrega: "delivery",
      items: [{ productoId, cantidad: 1 }],
    });

    expect(res.status).toBe(400);
    expect(Object.keys(res.body.detalles.fieldErrors)).toEqual(
      expect.arrayContaining(["provincia", "distrito", "direccionEntrega"]),
    );
  });

  it("RB16 · en delivery no acepta un destino de solo espacios", async () => {
    const res = await postPedido({
      nombre: "Ana",
      provincia: "   ",
      distrito: "   ",
      direccionEntrega: "   ",
      metodoEntrega: "delivery",
      items: [{ productoId, cantidad: 1 }],
    });
    expect(res.status).toBe(400);
  });

  it("rechaza un método de entrega no soportado (sin pasarela, RB11)", async () => {
    const res = await postPedido({
      nombre: "Ana",
      metodoEntrega: "tarjeta",
      items: [{ productoId, cantidad: 1 }],
    });
    expect(res.status).toBe(400);
  });

  it("rechaza cantidades cero, negativas o decimales (RB07)", async () => {
    for (const cantidad of [0, -2, 1.5]) {
      const res = await postPedido({
        nombre: "Ana",
        metodoEntrega: "recojo",
        items: [{ productoId, cantidad }],
      });
      expect(res.status, `cantidad ${cantidad}`).toBe(400);
    }
  });

  it("rechaza un usuarioId que no sea UUID", async () => {
    const res = await postPedido({
      nombre: "Ana",
      metodoEntrega: "recojo",
      usuarioId: "no-es-uuid",
      items: [{ productoId, cantidad: 1 }],
    });
    expect(res.status).toBe(400);
  });

  it("rechaza un cuerpo vacío con 400 y el detalle de los campos", async () => {
    const res = await postPedido({});
    expect(res.status).toBe(400);
    expect(res.body.detalles.fieldErrors).toHaveProperty("nombre");
    expect(res.body.detalles.fieldErrors).toHaveProperty("items");
  });

  it("CP14 · no existe ningún endpoint de pago asociado al pedido (RB11)", async () => {
    for (const ruta of ["/api/v1/orders/pay", "/api/v1/orders/checkout"]) {
      const res = await request(app).post(ruta).send({});
      expect(res.status).toBe(404);
    }
  });
});
