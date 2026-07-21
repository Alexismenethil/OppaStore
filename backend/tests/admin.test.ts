import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import {
  borrarPedidos,
  borrarProducto,
  borrarUsuario,
  crearProducto,
  prisma,
  snapshotSiteConfig,
  tokenSinUsuario,
  usuarioConToken,
} from "./helpers";

/**
 * Pruebas de integración del panel admin (RF42–RF48, HU08/HU09/HU13/HU16).
 * Cubre CP21 (acceso restringido), CP16 (crear/editar/estado) y CP17 (borrado
 * lógico oculto del catálogo). Requieren la base de datos levantada.
 *
 * Toda escritura se revierte: los productos/pedidos creados se eliminan y la
 * configuración del sitio y las categorías se restauran desde un snapshot, de
 * modo que la suite no deja URLs ficticias ni contenido que afecte a los E2E.
 */
const app = crearApp();

describe("API — panel admin (RF42–RF48)", () => {
  let adminToken: string;
  let adminId: string;
  let clienteToken: string;
  let restaurarConfig: () => Promise<void>;
  const pedidosCreados: string[] = [];
  const productosCreados: string[] = [];

  beforeAll(async () => {
    const admin = await usuarioConToken("admin-panel", true);
    adminToken = admin.token;
    adminId = admin.usuario.id;
    // Cliente normal del sitio → token válido pero sin permisos admin.
    clienteToken = tokenSinUsuario(false);
    restaurarConfig = await snapshotSiteConfig();
  });

  afterAll(async () => {
    await borrarPedidos(pedidosCreados);
    for (const id of productosCreados) await borrarProducto(id);
    await restaurarConfig();
    await borrarUsuario(adminId);
  });

  const auth = () => ({ Authorization: `Bearer ${adminToken}` });

  // ── CP21 · Acceso restringido ─────────────────────────────────────────────
  it("CP21 · GET /admin/products sin token responde 401", async () => {
    const res = await request(app).get("/api/v1/admin/products");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Sesión requerida");
  });

  it("CP21 · GET /admin/products con token no-admin responde 403", async () => {
    const res = await request(app)
      .get("/api/v1/admin/products")
      .set("Authorization", `Bearer ${clienteToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Acceso restringido a administradores");
  });

  it("CP21 · RB23 · todas las rutas del panel exigen sesión admin", async () => {
    const rutas = [
      "/api/v1/admin/products",
      "/api/v1/admin/categories",
      "/api/v1/admin/config",
      "/api/v1/admin/orders",
      "/api/v1/admin/users",
      "/api/v1/admin/summary",
    ];
    for (const ruta of rutas) {
      expect((await request(app).get(ruta)).status, `${ruta} sin token`).toBe(401);
      expect(
        (await request(app).get(ruta).set("Authorization", `Bearer ${clienteToken}`)).status,
        `${ruta} con cliente`,
      ).toBe(403);
    }
  });

  it("CP21 · un token inválido responde 401, no 403", async () => {
    const res = await request(app)
      .get("/api/v1/admin/summary")
      .set("Authorization", "Bearer token-falso");
    expect(res.status).toBe(401);
  });

  it("GET /admin/products (admin) devuelve la lista, incluidos inactivos (RF48)", async () => {
    const oculto = await crearProducto("admin-inactivo", { activo: false });
    productosCreados.push(oculto.id);

    const res = await request(app).get("/api/v1/admin/products").set(auth());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((p: { id: string }) => p.id === oculto.id)).toBe(true);
    expect(res.body.some((p: { activo: boolean }) => p.activo === false)).toBe(true);
  });

  // ── CP16 · Crear / editar / estado ────────────────────────────────────────
  it("CP16 · crea, edita, cambia estado y borra un producto (RF43–RF46)", async () => {
    // Crear (RF43)
    const crear = await request(app)
      .post("/api/v1/admin/products")
      .set(auth())
      .send({
        nombre: "Producto de Prueba QA",
        descripcion: "Creado por la suite de pruebas.",
        precio: 30.5,
        stock: 10,
        categoriaSlug: "skincare",
        tipo: "skincare",
      });
    expect(crear.status).toBe(201);
    expect(crear.body.slug).toBe("producto-de-prueba-qa");
    const id = crear.body.id;

    // Editar precio y stock (RF44, RF46)
    const editar = await request(app)
      .put(`/api/v1/admin/products/${id}`)
      .set(auth())
      .send({ precio: 45, stock: 3 });
    expect(editar.status).toBe(200);
    expect(Number(editar.body.precio)).toBe(45);
    expect(editar.body.stock).toBe(3);

    // Desactivar → oculto del catálogo público (CP17, RF45)
    const desactivar = await request(app)
      .patch(`/api/v1/admin/products/${id}/estado`)
      .set(auth())
      .send({ activo: false });
    expect(desactivar.status).toBe(200);
    expect(desactivar.body.activo).toBe(false);

    const publico = await request(app).get("/api/v1/products");
    expect(publico.body.some((p: { id: string }) => p.id === id)).toBe(false);

    // Borrar (sin historial → físico)
    const borrar = await request(app).delete(`/api/v1/admin/products/${id}`).set(auth());
    expect(borrar.status).toBe(200);
    expect(borrar.body.eliminado).toBe("fisico");

    const adminList = await request(app).get("/api/v1/admin/products").set(auth());
    expect(adminList.body.some((p: { id: string }) => p.id === id)).toBe(false);
  });

  it("RF43 · el slug se autogenera con sufijo cuando ya existe", async () => {
    const cuerpo = {
      nombre: "Serum Duplicado QA",
      descripcion: "desc",
      precio: 10,
      stock: 1,
      categoriaSlug: "skincare",
      tipo: "skincare" as const,
    };
    const primero = await request(app).post("/api/v1/admin/products").set(auth()).send(cuerpo);
    const segundo = await request(app).post("/api/v1/admin/products").set(auth()).send(cuerpo);
    productosCreados.push(primero.body.id, segundo.body.id);

    expect(primero.body.slug).toBe("serum-duplicado-qa");
    expect(segundo.body.slug).toBe("serum-duplicado-qa-2");
  });

  it("CP17 · un producto con historial de pedidos se borra de forma lógica (RB22)", async () => {
    const p = await crearProducto("admin-con-historial", { stock: 5, precio: 20 });
    productosCreados.push(p.id);

    const pedido = await request(app)
      .post("/api/v1/orders")
      .send({ nombre: "Cliente QA", metodoEntrega: "recojo", items: [{ productoId: p.id, cantidad: 1 }] });
    pedidosCreados.push(pedido.body.pedido.id);

    const borrar = await request(app).delete(`/api/v1/admin/products/${p.id}`).set(auth());
    expect(borrar.status).toBe(200);
    expect(borrar.body.eliminado).toBe("logico");
    expect(borrar.body.producto.activo).toBe(false);

    // Sigue existiendo en el panel, pero no en el catálogo público (RB10).
    const enAdmin = await request(app).get("/api/v1/admin/products").set(auth());
    expect(enAdmin.body.some((x: { id: string }) => x.id === p.id)).toBe(true);
    const enPublico = await request(app).get("/api/v1/products");
    expect(enPublico.body.some((x: { id: string }) => x.id === p.id)).toBe(false);
  });

  it("valida el cuerpo al crear producto (400 en datos inválidos)", async () => {
    const res = await request(app)
      .post("/api/v1/admin/products")
      .set(auth())
      .send({ nombre: "", precio: -5, stock: 1, categoriaSlug: "skincare", tipo: "skincare", descripcion: "x" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Datos inválidos");
  });

  it("rechaza tipos, stock negativo y URLs de imagen inválidas (400)", async () => {
    const base = {
      nombre: "Producto Inválido QA",
      descripcion: "desc",
      precio: 10,
      stock: 1,
      categoriaSlug: "skincare",
    };

    const tipoMalo = await request(app)
      .post("/api/v1/admin/products")
      .set(auth())
      .send({ ...base, tipo: "electrodomestico" });
    expect(tipoMalo.status).toBe(400);

    const stockNegativo = await request(app)
      .post("/api/v1/admin/products")
      .set(auth())
      .send({ ...base, tipo: "general", stock: -1 });
    expect(stockNegativo.status).toBe(400);

    const urlMala = await request(app)
      .post("/api/v1/admin/products")
      .set(auth())
      .send({ ...base, tipo: "general", imagenUrl: "no-es-una-url" });
    expect(urlMala.status).toBe(400);
  });

  it("rechaza una categoría inexistente con 400", async () => {
    const res = await request(app).post("/api/v1/admin/products").set(auth()).send({
      nombre: "Producto Sin Categoría QA",
      descripcion: "desc",
      precio: 10,
      stock: 1,
      categoriaSlug: "categoria-inventada",
      tipo: "general",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("La categoría no existe");
  });

  it("editar, cambiar estado o borrar un producto inexistente responde 404", async () => {
    const id = "00000000-0000-0000-0000-0000000000ff";

    const editar = await request(app)
      .put(`/api/v1/admin/products/${id}`)
      .set(auth())
      .send({ precio: 10 });
    expect(editar.status).toBe(404);
    expect(editar.body.error).toBe("Producto no encontrado");

    const estado = await request(app)
      .patch(`/api/v1/admin/products/${id}/estado`)
      .set(auth())
      .send({ activo: false });
    expect(estado.status).toBe(404);

    const borrar = await request(app).delete(`/api/v1/admin/products/${id}`).set(auth());
    expect(borrar.status).toBe(404);
  });

  it("PATCH estado exige un booleano (400)", async () => {
    const p = await crearProducto("admin-estado");
    productosCreados.push(p.id);

    const res = await request(app)
      .patch(`/api/v1/admin/products/${p.id}/estado`)
      .set(auth())
      .send({ activo: "si" });
    expect(res.status).toBe(400);
  });

  it("RF45 · reactivar un producto lo devuelve al catálogo público (CP17)", async () => {
    const p = await crearProducto("admin-reactivable", { activo: false });
    productosCreados.push(p.id);

    const activar = await request(app)
      .patch(`/api/v1/admin/products/${p.id}/estado`)
      .set(auth())
      .send({ activo: true });
    expect(activar.body.activo).toBe(true);

    const publico = await request(app).get("/api/v1/products");
    expect(publico.body.some((x: { id: string }) => x.id === p.id)).toBe(true);
  });

  // ── HU16 · Historial de pedidos + estado ──────────────────────────────────
  it("HU16 · lista pedidos y actualiza su estado (RF48)", async () => {
    const p = await crearProducto("admin-pedido", { stock: 5 });
    productosCreados.push(p.id);

    const creado = await request(app)
      .post("/api/v1/orders")
      .send({ nombre: "Cliente QA", metodoEntrega: "recojo", items: [{ productoId: p.id, cantidad: 1 }] });
    pedidosCreados.push(creado.body.pedido.id);

    const lista = await request(app).get("/api/v1/admin/orders").set(auth());
    expect(lista.status).toBe(200);
    expect(lista.body.some((x: { id: string }) => x.id === creado.body.pedido.id)).toBe(true);

    const cambio = await request(app)
      .patch(`/api/v1/admin/orders/${creado.body.pedido.id}/estado`)
      .set(auth())
      .send({ estado: "coordinado" });
    expect(cambio.status).toBe(200);
    expect(cambio.body.estado).toBe("coordinado");
  });

  it("PATCH estado de pedido rechaza estados fuera del enum (400) e ids inexistentes (404)", async () => {
    const p = await crearProducto("admin-pedido-estado", { stock: 5 });
    productosCreados.push(p.id);
    const creado = await request(app)
      .post("/api/v1/orders")
      .send({ nombre: "Cliente QA", metodoEntrega: "recojo", items: [{ productoId: p.id, cantidad: 1 }] });
    pedidosCreados.push(creado.body.pedido.id);

    const invalido = await request(app)
      .patch(`/api/v1/admin/orders/${creado.body.pedido.id}/estado`)
      .set(auth())
      .send({ estado: "pagado" });
    expect(invalido.status).toBe(400);

    const inexistente = await request(app)
      .patch("/api/v1/admin/orders/00000000-0000-0000-0000-0000000000ff/estado")
      .set(auth())
      .send({ estado: "entregado" });
    expect(inexistente.status).toBe(404);
    expect(inexistente.body.error).toBe("Pedido no encontrado");
  });

  it("HU16 · el historial incluye las líneas con snapshot de precio (RB22)", async () => {
    const p = await crearProducto("admin-historial-lineas", { stock: 5, precio: 33 });
    productosCreados.push(p.id);
    const creado = await request(app)
      .post("/api/v1/orders")
      .send({ nombre: "Cliente QA", metodoEntrega: "recojo", items: [{ productoId: p.id, cantidad: 2 }] });
    pedidosCreados.push(creado.body.pedido.id);

    const lista = await request(app).get("/api/v1/admin/orders").set(auth());
    const pedido = lista.body.find((x: { id: string }) => x.id === creado.body.pedido.id);
    expect(pedido.items).toHaveLength(1);
    expect(Number(pedido.items[0].precioUnitario)).toBe(33);
    expect(pedido.usuario).toBeNull(); // pedido de invitado
  });

  // ── Contenido del sitio ───────────────────────────────────────────────────
  it("PUT /admin/config actualiza y GET /config lo refleja (RF10)", async () => {
    const put = await request(app)
      .put("/api/v1/admin/config")
      .set(auth())
      .send({ instagram: "https://instagram.com/oppastore.qa", whatsapp: "51987654321" });
    expect(put.status).toBe(200);
    expect(put.body.instagram).toBe("https://instagram.com/oppastore.qa");

    const publico = await request(app).get("/api/v1/config");
    expect(publico.body.whatsapp).toBe("51987654321");
    // El snapshot de `afterAll` restaura los valores reales del negocio.
  });

  it("PUT /admin/config rechaza URLs de hero inválidas (400)", async () => {
    const res = await request(app)
      .put("/api/v1/admin/config")
      .set(auth())
      .send({ heroFlatLayUrl: "no-es-una-url" });
    expect(res.status).toBe(400);
  });

  it("PUT /admin/config acepta limpiar campos con null", async () => {
    const res = await request(app).put("/api/v1/admin/config").set(auth()).send({ tiktok: null });
    expect(res.status).toBe(200);
    expect(res.body.tiktok).toBeNull();
  });

  it("PUT /admin/categories/:slug edita la foto de la categoría (RF43)", async () => {
    const categorias = await request(app).get("/api/v1/categories");
    const imagenOriginal = categorias.body.find(
      (categoria: { slug: string }) => categoria.slug === "skincare",
    )?.imagenUrl;
    expect(imagenOriginal).toBeTruthy();

    try {
      const res = await request(app)
        .put("/api/v1/admin/categories/skincare")
        .set(auth())
        .send({ imagenUrl: "https://example.com/skincare-qa.jpg" });
      expect(res.status).toBe(200);
      expect(res.body.imagenUrl).toBe("https://example.com/skincare-qa.jpg");
    } finally {
      // La prueba no debe dejar una URL ficticia que afecte a los E2E posteriores.
      await request(app)
        .put("/api/v1/admin/categories/skincare")
        .set(auth())
        .send({ imagenUrl: imagenOriginal });
    }
  });

  it("PUT /admin/categories responde 404 con un slug inexistente y 400 con datos inválidos", async () => {
    const inexistente = await request(app)
      .put("/api/v1/admin/categories/categoria-inventada")
      .set(auth())
      .send({ nombre: "X" });
    expect(inexistente.status).toBe(404);
    expect(inexistente.body.error).toBe("Categoría no encontrada");

    const invalido = await request(app)
      .put("/api/v1/admin/categories/skincare")
      .set(auth())
      .send({ imagenUrl: "no-es-una-url" });
    expect(invalido.status).toBe(400);
  });

  it("GET /admin/categories devuelve las categorías completas ordenadas", async () => {
    const res = await request(app).get("/api/v1/admin/categories").set(auth());
    expect(res.status).toBe(200);
    const ordenes = res.body.map((c: { orden: number }) => c.orden);
    expect(ordenes).toEqual([...ordenes].sort((a, b) => a - b));
  });

  it("GET /admin/config devuelve la configuración editable", async () => {
    const res = await request(app).get("/api/v1/admin/config").set(auth());
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("default");
  });

  it("GET /admin/users devuelve la lista de usuarios (RB23)", async () => {
    const res = await request(app).get("/api/v1/admin/users").set(auth());
    expect(res.status).toBe(200);
    expect(res.body.some((u: { id: string }) => u.id === adminId)).toBe(true);
    // Solo lectura y sin exponer el identificador de Google.
    expect(res.body[0]).not.toHaveProperty("googleId");
  });

  it("GET /admin/summary devuelve métricas coherentes del tablero", async () => {
    const res = await request(app).get("/api/v1/admin/summary").set(auth());
    expect(res.status).toBe(200);
    expect(res.body.productos).toHaveProperty("activos");
    expect(res.body.pedidos).toHaveProperty("total");
    expect(typeof res.body.ventas).toBe("number");

    const { total, activos, inactivos } = res.body.productos;
    expect(activos + inactivos).toBe(total);
    expect(total).toBe(await prisma.producto.count());
    expect(res.body.usuarios).toBe(await prisma.usuario.count());
  });

  it("el tablero cuenta como 'stock bajo' solo los activos con 1..5 unidades (RB09)", async () => {
    const antes = await request(app).get("/api/v1/admin/summary").set(auth());

    const bajo = await crearProducto("admin-stock-bajo", { stock: 3 });
    const agotado = await crearProducto("admin-stock-cero", { stock: 0 });
    productosCreados.push(bajo.id, agotado.id);

    const despues = await request(app).get("/api/v1/admin/summary").set(auth());
    expect(despues.body.productos.stockBajo).toBe(antes.body.productos.stockBajo + 1);
    expect(despues.body.productos.agotados).toBe(antes.body.productos.agotados + 1);
  });

  it("POST /admin/uploads/sign responde 501 si Cloudinary no está configurado", async () => {
    const previas = {
      cloud: process.env.CLOUDINARY_CLOUD_NAME,
      key: process.env.CLOUDINARY_API_KEY,
      secret: process.env.CLOUDINARY_API_SECRET,
    };
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    try {
      const res = await request(app).post("/api/v1/admin/uploads/sign").set(auth());
      expect(res.status).toBe(501);
    } finally {
      if (previas.cloud) process.env.CLOUDINARY_CLOUD_NAME = previas.cloud;
      if (previas.key) process.env.CLOUDINARY_API_KEY = previas.key;
      if (previas.secret) process.env.CLOUDINARY_API_SECRET = previas.secret;
    }
  });

  it("RF43 · POST /admin/uploads/sign devuelve la firma cuando Cloudinary está configurado", async () => {
    const previas = {
      cloud: process.env.CLOUDINARY_CLOUD_NAME,
      key: process.env.CLOUDINARY_API_KEY,
      secret: process.env.CLOUDINARY_API_SECRET,
    };
    process.env.CLOUDINARY_CLOUD_NAME = "demo-qa";
    process.env.CLOUDINARY_API_KEY = "clave-qa";
    process.env.CLOUDINARY_API_SECRET = "secreto-qa";

    try {
      const res = await request(app).post("/api/v1/admin/uploads/sign").set(auth());
      expect(res.status).toBe(200);
      expect(res.body.cloudName).toBe("demo-qa");
      expect(typeof res.body.signature).toBe("string");
      expect(typeof res.body.timestamp).toBe("number");
      expect(JSON.stringify(res.body)).not.toContain("secreto-qa"); // el secreto no sale del servidor
    } finally {
      for (const [nombre, valor] of Object.entries({
        CLOUDINARY_CLOUD_NAME: previas.cloud,
        CLOUDINARY_API_KEY: previas.key,
        CLOUDINARY_API_SECRET: previas.secret,
      })) {
        if (valor === undefined) delete process.env[nombre];
        else process.env[nombre] = valor;
      }
    }
  });

  it("CP21 · la subida firmada también exige sesión admin", async () => {
    expect((await request(app).post("/api/v1/admin/uploads/sign")).status).toBe(401);
    expect(
      (
        await request(app)
          .post("/api/v1/admin/uploads/sign")
          .set("Authorization", `Bearer ${clienteToken}`)
      ).status,
    ).toBe(403);
  });

  // ── Home público ──────────────────────────────────────────────────────────
  it("GET /products/destacados devuelve los más pedidos (auto)", async () => {
    const res = await request(app).get("/api/v1/products/destacados?limit=4");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.length).toBeLessThanOrEqual(4);
  });

  it("GET /categories devuelve las categorías con foto", async () => {
    const res = await request(app).get("/api/v1/categories");
    expect(res.status).toBe(200);
    expect(res.body.some((c: { slug: string }) => c.slug === "skincare")).toBe(true);
  });
});
