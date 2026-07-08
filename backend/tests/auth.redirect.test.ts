import "dotenv/config";
import { describe, expect, it } from "vitest";
import { rutaFrontendSeguro, urlFrontend } from "../src/routes/auth";

describe("auth redirect helpers", () => {
  it("acepta rutas internas como destino post-login", () => {
    expect(rutaFrontendSeguro("/admin/productos")).toBe("/admin/productos");
    expect(rutaFrontendSeguro("/admin?tab=pedidos")).toBe("/admin?tab=pedidos");
  });

  it("bloquea destinos externos o inválidos", () => {
    expect(rutaFrontendSeguro("https://evil.com")).toBe("/cuenta");
    expect(rutaFrontendSeguro("//evil.com")).toBe("/cuenta");
    expect(rutaFrontendSeguro(undefined)).toBe("/cuenta");
  });

  it("construye la URL final del frontend con error o token", () => {
    expect(urlFrontend("/admin", { error: "sin_codigo" })).toBe("http://localhost:3000/admin?error=sin_codigo");
    expect(urlFrontend("/admin", { token: "abc123" })).toBe("http://localhost:3000/admin#token=abc123");
  });
});
