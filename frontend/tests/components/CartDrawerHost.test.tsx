import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartDrawerHost } from "@/features/cart/CartDrawerHost";
import { construirMensaje, enlaceWhatsapp } from "@/domain/whatsapp";
import type { ItemCarrito, Producto } from "@/domain/types";

const crearPedidoMock = vi.fn();
const mostrarMock = vi.fn();
const vaciarMock = vi.fn();
const cerrarMock = vi.fn();
const cambiarCantidadMock = vi.fn();
const eliminarMock = vi.fn();
const configMock = { whatsapp: "+51 917785052" as string | null };
const authMock = { usuario: null as { nombre: string; esAdmin: boolean } | null };

const TONICO: Producto = {
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
};

const cartMock = {
  items: [{ producto: TONICO, cantidad: 1 }] as ItemCarrito[],
  total: 65,
};

vi.mock("@/lib/api/orders", () => ({
  crearPedido: (...args: unknown[]) => crearPedidoMock(...args),
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ mostrar: mostrarMock }),
}));

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => authMock,
}));

vi.mock("@/features/config/ConfigContext", () => ({
  useSiteConfig: () => ({ config: configMock, categorias: [] }),
}));

vi.mock("@/features/cart/CartContext", () => ({
  useCart: () => ({
    items: cartMock.items,
    abierto: true,
    cerrar: cerrarMock,
    cambiarCantidad: cambiarCantidadMock,
    eliminar: eliminarMock,
    vaciar: vaciarMock,
    total: cartMock.total,
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

/** Ventana simulada para la pestaña reservada antes del POST. */
function popupFalso() {
  return {
    closed: false,
    focus: vi.fn(),
    location: { replace: vi.fn() },
  } as unknown as Window & { location: { replace: ReturnType<typeof vi.fn> } };
}

describe("CartDrawerHost (RF28–RF29)", () => {
  beforeEach(() => {
    crearPedidoMock.mockReset();
    mostrarMock.mockReset();
    vaciarMock.mockReset();
    cerrarMock.mockReset();
    cambiarCantidadMock.mockReset();
    eliminarMock.mockReset();
    configMock.whatsapp = "+51 917785052";
    authMock.usuario = null;
    cartMock.items = [{ producto: TONICO, cantidad: 1 }];
    cartMock.total = 65;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reserva la pestaña antes del POST y redirige al WhatsApp configurado del negocio", async () => {
    const diferido = defer<{ pedido: { id: string; estado: string }; mensaje: string }>();
    const popup = popupFalso();

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

  it("RNF09 · si el POST falla abre WhatsApp con el mensaje generado localmente", async () => {
    const popup = popupFalso();
    crearPedidoMock.mockRejectedValueOnce(new Error("backend caído"));
    vi.spyOn(window, "open").mockReturnValue(popup);

    render(<CartDrawerHost />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await user.type(await screen.findByLabelText(/tu nombre/i), "Ana Quispe");
    await user.click(screen.getByRole("button", { name: /enviar pedido por whatsapp/i }));

    const esperado = construirMensaje(cartMock.items, {
      nombre: "Ana Quispe",
      provincia: "",
      distrito: "Recojo en tienda",
      direccionEntrega: "",
      metodoEntrega: "recojo",
    });

    await waitFor(() => {
      expect(popup.location.replace).toHaveBeenCalledWith(
        enlaceWhatsapp(configMock.whatsapp!, esperado),
      );
    });
    expect(mostrarMock).toHaveBeenCalledWith(
      "aviso",
      "No pudimos registrar el pedido, pero tu WhatsApp está listo 💬",
    );
    expect(vaciarMock).toHaveBeenCalledOnce(); // la venta no se pierde
  });

  it("si el navegador bloquea la pestaña reservada, redirige en la pestaña actual", async () => {
    crearPedidoMock.mockResolvedValueOnce({ pedido: { id: "p" }, mensaje: "Hola" });
    vi.spyOn(window, "open").mockReturnValue(null); // popup bloqueado
    const asignar = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign: asignar });

    try {
      render(<CartDrawerHost />);
      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: /continuar/i }));
      await user.type(await screen.findByLabelText(/tu nombre/i), "Ana Quispe");
      await user.click(screen.getByRole("button", { name: /enviar pedido por whatsapp/i }));

      await waitFor(() =>
        expect(asignar).toHaveBeenCalledWith(enlaceWhatsapp(configMock.whatsapp!, "Hola")),
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("si la pestaña reservada ya se cerró, también cae a la pestaña actual", async () => {
    crearPedidoMock.mockResolvedValueOnce({ pedido: { id: "p" }, mensaje: "Hola" });
    const popup = popupFalso();
    (popup as unknown as { closed: boolean }).closed = true;
    vi.spyOn(window, "open").mockReturnValue(popup);
    const asignar = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign: asignar });

    try {
      render(<CartDrawerHost />);
      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: /continuar/i }));
      await user.type(await screen.findByLabelText(/tu nombre/i), "Ana Quispe");
      await user.click(screen.getByRole("button", { name: /enviar pedido por whatsapp/i }));

      await waitFor(() => expect(asignar).toHaveBeenCalledOnce());
      expect(popup.location.replace).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("RF27 · con datos inválidos no llama a la API y muestra el error del formulario", async () => {
    vi.spyOn(window, "open").mockReturnValue(popupFalso());

    render(<CartDrawerHost />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await user.click(await screen.findByRole("button", { name: /enviar pedido por whatsapp/i }));

    expect(await screen.findByText(/ingresa tu nombre/i)).toBeInTheDocument();
    expect(crearPedidoMock).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });

  it("sin WhatsApp configurado avisa y no registra el pedido", async () => {
    configMock.whatsapp = null;
    vi.spyOn(window, "open").mockReturnValue(popupFalso());

    render(<CartDrawerHost />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await user.type(await screen.findByLabelText(/tu nombre/i), "Ana Quispe");
    await user.click(screen.getByRole("button", { name: /enviar pedido por whatsapp/i }));

    expect(mostrarMock).toHaveBeenCalledWith(
      "aviso",
      "Configura el WhatsApp del negocio para poder enviar pedidos",
    );
    expect(crearPedidoMock).not.toHaveBeenCalled();
  });

  it("un carrito vacío no dispara el registro del pedido", async () => {
    cartMock.items = [];
    cartMock.total = 0;
    render(<CartDrawerHost />);
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
    expect(crearPedidoMock).not.toHaveBeenCalled();
  });

  it("CP06 · al llegar al stock el botón + queda deshabilitado y no cambia la cantidad", async () => {
    cartMock.items = [{ producto: TONICO, cantidad: 5 }]; // stock = 5
    render(<CartDrawerHost />);
    expect(screen.getByRole("button", { name: /aumentar cantidad de tónico yuja/i })).toBeDisabled();
    expect(cambiarCantidadMock).not.toHaveBeenCalled();
  });

  it("aumentar dentro del stock delega en el carrito global (RB01)", async () => {
    render(<CartDrawerHost />);
    await userEvent.click(screen.getByRole("button", { name: /aumentar cantidad de tónico yuja/i }));
    expect(cambiarCantidadMock).toHaveBeenCalledWith("prod-1", 2);
  });

  it("CP08 · eliminar quita el ítem y lo confirma con un aviso", async () => {
    render(<CartDrawerHost />);
    await userEvent.click(screen.getByRole("button", { name: /^eliminar$/i }));
    expect(eliminarMock).toHaveBeenCalledWith("prod-1");
    expect(mostrarMock).toHaveBeenCalledWith("exito", '"Tónico Yuja" eliminado del carrito');
  });

  it("desde el paso de datos se puede volver al carrito", async () => {
    render(<CartDrawerHost />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(await screen.findByLabelText(/tu nombre/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /volver al carrito/i }));
    await waitFor(() => expect(screen.queryByLabelText(/tu nombre/i)).not.toBeInTheDocument());
    expect(screen.getByTestId("total-carrito")).toHaveTextContent("S/ 65.00");
  });

  it("RF38 · precarga el nombre del cliente autenticado (no el del admin)", async () => {
    authMock.usuario = { nombre: "Ana Quispe", esAdmin: false };
    render(<CartDrawerHost />);
    await userEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(await screen.findByLabelText(/tu nombre/i)).toHaveValue("Ana Quispe");
  });

  it("no precarga el nombre cuando la sesión es de administrador", async () => {
    authMock.usuario = { nombre: "Administrador OppaStore", esAdmin: true };
    render(<CartDrawerHost />);
    await userEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(await screen.findByLabelText(/tu nombre/i)).toHaveValue("");
  });

  it("cambiar a delivery pide el destino y limpia el distrito al cambiar de provincia", async () => {
    render(<CartDrawerHost />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await user.click(await screen.findByRole("radio", { name: /delivery/i }));

    await user.type(screen.getByLabelText(/provincia/i), "aya");
    await user.click(screen.getByRole("option", { name: "Ayacucho" }));
    await user.type(screen.getByLabelText(/distrito/i), "naz");
    await user.click(screen.getByRole("option", { name: /jesús nazareno/i }));
    expect(screen.getByLabelText(/distrito/i)).toHaveValue("Jesús Nazareno");

    // Al cambiar de provincia el distrito deja de ser válido y se limpia.
    await user.clear(screen.getByLabelText(/provincia/i));
    await user.type(screen.getByLabelText(/provincia/i), "lima");
    await user.click(screen.getByRole("option", { name: "Lima" }));
    expect(screen.getByLabelText(/distrito/i)).toHaveValue("");
  });

  it("volver a recojo descarta el destino ya escrito", async () => {
    render(<CartDrawerHost />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await user.click(await screen.findByRole("radio", { name: /delivery/i }));
    await user.type(screen.getByLabelText(/provincia/i), "aya");
    await user.click(screen.getByRole("option", { name: "Ayacucho" }));

    await user.click(screen.getByRole("radio", { name: /recojo en tienda/i }));
    await waitFor(() => expect(screen.queryByLabelText(/provincia/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("radio", { name: /delivery/i }));
    expect(await screen.findByLabelText(/provincia/i)).toHaveValue("");
  });
});
