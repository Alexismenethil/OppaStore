import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { ConfigProvider, useSiteConfig } from "@/features/config/ConfigContext";
import type { CategoriaMedia, SiteConfig } from "@/lib/api/config";

const fetchConfigMock = vi.fn();
const fetchCategoriasMock = vi.fn();

vi.mock("@/lib/api/config", () => ({
  fetchConfig: () => fetchConfigMock(),
  fetchCategorias: () => fetchCategoriasMock(),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <ConfigProvider>{children}</ConfigProvider>;
}

function renderConfig() {
  return renderHook(() => useSiteConfig(), { wrapper });
}

const CONFIG_API: SiteConfig = {
  heroFlatLayUrl: "https://cdn/hero.jpg",
  heroPandaUrl: null,
  heroPandaEtiqueta: "",
  dropHomeProductoId: "p7",
  whatsapp: "51917785052",
  email: "hola@oppastore.pe",
  facebook: null,
  instagram: "https://instagram.com/oppastore",
  tiktok: null,
  direccion: "Jr. Lima 123",
};

/**
 * Contenido editable del sitio con respaldo a los valores del diseño (RNF09):
 * si la API cae o devuelve nulos, siguen aplicando los valores por defecto.
 */
describe("ConfigContext (RF10, RNF09)", () => {
  beforeEach(() => {
    fetchConfigMock.mockReset();
    fetchCategoriasMock.mockReset();
  });

  it("arranca con los valores por defecto del diseño antes de responder la API", () => {
    fetchConfigMock.mockReturnValue(new Promise(() => {}));
    fetchCategoriasMock.mockReturnValue(new Promise(() => {}));

    const { result } = renderConfig();
    expect(result.current.config.direccion).toBe("Ayacucho, Perú · Atención online");
    expect(result.current.categorias.length).toBeGreaterThan(0);
    expect(result.current.categorias[0].slug).toBe("skincare");
  });

  it("aplica la configuración de la API cuando responde", async () => {
    fetchConfigMock.mockResolvedValue(CONFIG_API);
    fetchCategoriasMock.mockResolvedValue([]);

    const { result } = renderConfig();
    await waitFor(() => expect(result.current.config.whatsapp).toBe("51917785052"));
    expect(result.current.config.direccion).toBe("Jr. Lima 123");
    expect(result.current.config.dropHomeProductoId).toBe("p7");
  });

  it("descarta los campos nulos o vacíos de la API para no borrar los valores del diseño", async () => {
    fetchConfigMock.mockResolvedValue(CONFIG_API);
    fetchCategoriasMock.mockResolvedValue([]);

    const { result } = renderConfig();
    await waitFor(() => expect(result.current.config.whatsapp).toBe("51917785052"));
    // heroPandaEtiqueta llegó como "" y heroPandaUrl como null.
    expect(result.current.config.heroPandaEtiqueta).toBe("Novedad Kawaii");
    expect(result.current.config.heroPandaUrl).toBeTruthy();
  });

  it("reemplaza las categorías si la API devuelve alguna", async () => {
    const cats: CategoriaMedia[] = [
      { slug: "drops", nombre: "Drops", imagenUrl: "https://cdn/drops.jpg", overlay: null, orden: 1 },
    ];
    fetchConfigMock.mockResolvedValue(CONFIG_API);
    fetchCategoriasMock.mockResolvedValue(cats);

    const { result } = renderConfig();
    await waitFor(() => expect(result.current.categorias).toHaveLength(1));
    expect(result.current.categorias[0].slug).toBe("drops");
  });

  it("una lista de categorías vacía conserva las del diseño (RNF09)", async () => {
    fetchConfigMock.mockResolvedValue(CONFIG_API);
    fetchCategoriasMock.mockResolvedValue([]);

    const { result } = renderConfig();
    await waitFor(() => expect(result.current.config.whatsapp).toBe("51917785052"));
    expect(result.current.categorias.length).toBeGreaterThan(1);
  });

  it("RNF09 · si la API falla, la tienda sigue con los valores por defecto", async () => {
    fetchConfigMock.mockRejectedValue(new Error("backend caído"));
    fetchCategoriasMock.mockRejectedValue(new Error("backend caído"));

    const { result } = renderConfig();
    await waitFor(() => expect(fetchConfigMock).toHaveBeenCalled());
    expect(result.current.config.direccion).toBe("Ayacucho, Perú · Atención online");
    expect(result.current.categorias.length).toBeGreaterThan(0);
  });

  it("useSiteConfig fuera del provider devuelve los valores por defecto (sin lanzar)", () => {
    const { result } = renderHook(() => useSiteConfig());
    expect(result.current.config.direccion).toBe("Ayacucho, Perú · Atención online");
  });

  it("no aplica una respuesta tardía después de desmontar (sin fugas)", async () => {
    let resolver: (c: SiteConfig) => void = () => {};
    fetchConfigMock.mockReturnValue(new Promise<SiteConfig>((res) => (resolver = res)));
    fetchCategoriasMock.mockResolvedValue([]);

    const { unmount } = renderConfig();
    unmount();
    resolver(CONFIG_API);
    await Promise.resolve();
    // Si el efecto no respetara la bandera `vigente`, React avisaría por
    // actualizar un componente desmontado.
    expect(fetchConfigMock).toHaveBeenCalledOnce();
  });
});
