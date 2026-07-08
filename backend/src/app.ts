import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { productsRouter } from "./routes/products";
import { ordersRouter } from "./routes/orders";
import { authRouter } from "./routes/auth";
import { syncRouter } from "./routes/sync";
import { adminRouter } from "./routes/admin";
import { siteRouter } from "./routes/site";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
};

/** Crea la aplicación Express (exportada para pruebas de integración). */
export function crearApp() {
  const app = express();

  // En producción se restringe a los dominios configurados (RNF12);
  // en desarrollo se refleja cualquier origen (facilita previews con puerto dinámico).
  const origenCors =
    process.env.NODE_ENV === "production"
      ? (process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) ?? [])
      : true;
  app.use(cors({ origin: origenCors }));
  app.use(express.json());

  app.get("/api/v1/health", (_req, res) => {
    res.json({ ok: true, service: "oppastore-backend" });
  });

  app.use("/api/v1/products", productsRouter);
  app.use("/api/v1/orders", ordersRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/me", syncRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1", siteRouter);

  app.use(errorHandler);
  return app;
}
