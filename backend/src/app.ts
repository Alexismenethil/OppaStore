import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { productsRouter } from "./routes/products";
import { ordersRouter } from "./routes/orders";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
};

/** Crea la aplicación Express (exportada para pruebas de integración). */
export function crearApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") ?? true,
    }),
  );
  app.use(express.json());

  app.get("/api/v1/health", (_req, res) => {
    res.json({ ok: true, service: "oppastore-backend" });
  });

  app.use("/api/v1/products", productsRouter);
  app.use("/api/v1/orders", ordersRouter);

  app.use(errorHandler);
  return app;
}
