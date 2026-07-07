import { describe, it, expect } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";

describe("API — salud del servicio", () => {
  it("GET /api/v1/health responde ok", async () => {
    const res = await request(crearApp()).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, service: "oppastore-backend" });
  });

  it("CP14 · no expone ningún endpoint de pasarela de pagos (RB11)", async () => {
    const app = crearApp();
    for (const ruta of ["/api/v1/payments", "/api/v1/checkout", "/api/v1/stripe"]) {
      const res = await request(app).post(ruta).send({});
      expect(res.status).toBe(404);
    }
  });
});
