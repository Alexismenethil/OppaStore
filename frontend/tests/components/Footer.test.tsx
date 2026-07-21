import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/Footer";
import type { SiteConfig } from "@/lib/api/config";

const CONFIG_VACIA: SiteConfig = {
  heroFlatLayUrl: null,
  heroPandaUrl: null,
  heroPandaEtiqueta: null,
  dropHomeProductoId: null,
  whatsapp: null,
  email: null,
  facebook: null,
  instagram: null,
  tiktok: null,
  direccion: null,
};

const configMock = { valor: CONFIG_VACIA };

vi.mock("@/features/config/ConfigContext", () => ({
  useSiteConfig: () => ({ config: configMock.valor, categorias: [] }),
}));

function renderFooter(config: Partial<SiteConfig> = {}) {
  configMock.valor = { ...CONFIG_VACIA, ...config };
  return render(<Footer />);
}

describe("Footer (RF10, RB12)", () => {
  it("muestra los enlaces de tienda y ayuda siempre", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: /Catálogo/ })).toHaveAttribute("href", "/catalogo");
    expect(screen.getByRole("link", { name: /Favoritos/ })).toHaveAttribute("href", "/favoritos");
    expect(screen.getByRole("link", { name: /Cómo comprar/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Envíos en Ayacucho/ })).toBeInTheDocument();
  });

  it("RB12 · declara los medios de pago fuera del sistema (sin pasarela)", () => {
    renderFooter();
    expect(screen.getByText(/Yape, Plin y Efectivo/i)).toBeInTheDocument();
  });

  it("RF29 · construye el enlace de WhatsApp normalizando el número configurado", () => {
    renderFooter({ whatsapp: "+51 917 785 052" });
    const enlaces = screen.getAllByRole("link", { name: "WhatsApp" });
    expect(enlaces[0]).toHaveAttribute("href", "https://wa.me/51917785052");
    expect(enlaces[0]).toHaveAttribute("target", "_blank");
    expect(enlaces[0]).toHaveAttribute("rel", "noreferrer");
  });

  it("sin WhatsApp configurado no muestra el botón ni el ícono de la red", () => {
    renderFooter();
    expect(screen.queryByRole("link", { name: "WhatsApp" })).not.toBeInTheDocument();
  });

  it("muestra solo las redes sociales configuradas", () => {
    renderFooter({ instagram: "https://instagram.com/oppastore", tiktok: null, facebook: null });
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://instagram.com/oppastore",
    );
    expect(screen.queryByRole("link", { name: "Facebook" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "TikTok" })).not.toBeInTheDocument();
  });

  it("el correo genera un enlace mailto en la red y en la columna de ubicación", () => {
    renderFooter({ email: "hola@oppastore.pe" });
    const correos = screen.getAllByRole("link", { name: /hola@oppastore\.pe|Correo/ });
    expect(correos.length).toBeGreaterThan(0);
    correos.forEach((a) => expect(a).toHaveAttribute("href", "mailto:hola@oppastore.pe"));
  });

  it("usa la dirección configurada y cae a Ayacucho si no hay ninguna", () => {
    const { unmount } = renderFooter({ direccion: "Jr. Lima 123, Huamanga" });
    expect(screen.getByText("Jr. Lima 123, Huamanga")).toBeInTheDocument();
    unmount();

    renderFooter();
    expect(screen.getByText("Ayacucho, Perú")).toBeInTheDocument();
  });

  it("muestra las cuatro redes cuando están todas configuradas", () => {
    renderFooter({
      instagram: "https://instagram.com/oppastore",
      facebook: "https://facebook.com/oppastore",
      tiktok: "https://tiktok.com/@oppastore",
      whatsapp: "51999888777",
      email: "hola@oppastore.pe",
    });
    ["Instagram", "Facebook", "TikTok"].forEach((red) => {
      expect(screen.getByRole("link", { name: red })).toBeInTheDocument();
    });
    expect(screen.getAllByRole("link", { name: "WhatsApp" }).length).toBeGreaterThan(0);
  });

  it("el pie lleva el ancla #contacto usada por los enlaces de ayuda", () => {
    const { container } = renderFooter();
    expect(container.querySelector("footer#contacto")).toBeInTheDocument();
  });
});
