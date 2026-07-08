import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartDrawerHost } from "@/features/cart/CartDrawerHost";
import { enlaceWhatsapp } from "@/domain/whatsapp";

const crearPedidoMock = vi.fn();
const mostrarMock = vi.fn();
const vaciarMock = vi.fn();
const cerrarMock = vi.fn();
const configMock = { whatsapp: "+51 917785052" as string | null };

vi.mock("@/lib/api/orders", () => ({
  crearPedido: (...args: unknown[]) => crearPedidoMock(...args),
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ mostrar: mostrarMock }),
}));

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => ({ usuario: null }),
}));

vi.mock("@/features/config/ConfigContext", () => ({
  useSiteConfig: () => ({ config: configMock, categorias: [] }),
}));

vi.mock("@/features/cart/CartContext", () => ({
  useCart: () => ({
    items: [
      {
        producto: {
          id: "prod-1",
          slug: "tonico-yuja",
          nombre: "Tónico Yuja",
          descripcion: "desc",
          precio: 65,
          stock: 5,
          categoria: "skincare",
          tipo: "general",
          activo: true,
          esPreventa: false,
        },
        cantidad: 1,
      },
    ],
    abierto: true,
    cerrar: cerrarMock,
    cambiarCantidad: vi.fn(),
    eliminar: vi.fn(),
    vaciar: vaciarMock,
    total: 65,
  }),
}));

function defer<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("CartDrawerHost (RF28–RF29)", () => {
  beforeEach(() => {
    crearPedidoMock.mockReset();
    mostrarMock.mockReset();
    vaciarMock.mockReset();
    cerrarMock.mockReset();
    configMock.whatsapp = "+51 917785052";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reserva la pestaña antes del POST y redirige al WhatsApp configurado del negocio", async () => {
    const diferido = defer<{ pedido: { id: string; estado: string }; mensaje: string }>();
    const popup = {
      closed: false,
      focus: vi.fn(),
      location: { replace: vi.fn() },
    } as unknown as Window;

    crearPedidoMock.mockReturnValueOnce(diferido.promise);
    vi.spyOn(window, "open").mockReturnValue(popup);

    render(<CartDrawerHost />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await user.type(await screen.findByLabelText(/tu nombre/i), "Ana Quispe");
    await user.click(screen.getByRole("button", { name: /enviar pedido por whatsapp/i }));

    expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
    expect(crearPedidoMock).toHaveBeenCalledOnce();
    expect(popup.location.replace).not.toHaveBeenCalled();

    diferido.resolve({
      pedido: { id: "ped-1", estado: "pendiente" },
      mensaje: "Hola OppaStore",
    });

    await waitFor(() => {
      expect(popup.location.replace).toHaveBeenCalledWith(
        enlaceWhatsapp(configMock.whatsapp!, "Hola OppaStore"),
      );
    });

    expect(vaciarMock).toHaveBeenCalledOnce();
    expect(cerrarMock).toHaveBeenCalledOnce();
    expect(mostrarMock).toHaveBeenCalledWith(
      "exito",
      "¡Pedido registrado! Continúa la coordinación en WhatsApp 💚",
    );
  });
});
