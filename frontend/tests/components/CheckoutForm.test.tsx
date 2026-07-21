import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutForm } from "@/features/checkout/CheckoutForm";
import { validarDatosCliente, type ErroresCliente } from "@/domain/checkout";
import type { DatosCliente } from "@/domain/types";

/** Harness: integra el formulario con la validación del dominio (RF27). */
function Harness({ onEnviarOk }: { onEnviarOk: (d: DatosCliente) => void }) {
  const [datos, setDatos] = useState<Partial<DatosCliente>>({ metodoEntrega: "recojo" });
  const [errores, setErrores] = useState<ErroresCliente>({});
  return (
    <CheckoutForm
      datos={datos}
      errores={errores}
      enviando={false}
      total={100}
      onCambiar={(campo, valor) => {
        setDatos((p) => {
          const siguiente = { ...p, [campo]: valor };
          if (campo === "metodoEntrega" && valor === "recojo") {
            siguiente.provincia = "";
            siguiente.distrito = "";
            siguiente.direccionEntrega = "";
          }
          if (campo === "provincia") siguiente.distrito = "";
          return siguiente;
        });
        setErrores((p) => ({
          ...p,
          [campo]: undefined,
          ...(campo === "metodoEntrega" && valor === "recojo"
            ? { provincia: undefined, distrito: undefined, direccionEntrega: undefined }
            : {}),
          ...(campo === "provincia" ? { distrito: undefined } : {}),
        }));
      }}
      onEnviar={() => {
        const v = validarDatosCliente(datos);
        if (!v.ok) return setErrores(v.errores);
        onEnviarOk(datos as DatosCliente);
      }}
    />
  );
}

describe("CheckoutForm (RF27, CA11)", () => {
  it("muestra errores de validación si faltan datos (RB16)", async () => {
    render(<Harness onEnviarOk={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /enviar pedido por whatsapp/i }));
    expect(screen.getByText(/ingresa tu nombre/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/provincia/i)).not.toBeInTheDocument();
  });

  it("pide provincia, distrito y dirección solo cuando el método es delivery", async () => {
    render(<Harness onEnviarOk={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/tu nombre/i), "Ana Quispe");
    await userEvent.click(screen.getByRole("radio", { name: /delivery/i }));
    await userEvent.click(screen.getByRole("button", { name: /enviar pedido por whatsapp/i }));
    expect(screen.getByText(/selecciona una provincia/i)).toBeInTheDocument();
    expect(screen.getByText(/selecciona un distrito/i)).toBeInTheDocument();
    expect(screen.getByText(/indica una dirección o agencia/i)).toBeInTheDocument();
  });

  it("CP09 · con datos completos dispara el envío con destino nacional", async () => {
    const onEnviarOk = vi.fn();
    const user = userEvent.setup();
    render(<Harness onEnviarOk={onEnviarOk} />);
    await user.type(screen.getByLabelText(/tu nombre/i), "Ana Quispe");
    await user.click(screen.getByRole("radio", { name: /delivery/i }));
    await user.type(screen.getByLabelText(/provincia/i), "aya");
    await user.click(screen.getByRole("option", { name: "Ayacucho" }));
    await user.type(screen.getByLabelText(/distrito/i), "naz");
    await user.click(screen.getByRole("option", { name: /jesús nazareno/i }));
    await user.type(screen.getByLabelText(/dirección o agencia/i), "Agencia Shalom Ayacucho");
    await user.click(screen.getByRole("button", { name: /enviar pedido por whatsapp/i }));
    expect(onEnviarOk).toHaveBeenCalledWith({
      nombre: "Ana Quispe",
      provincia: "Ayacucho",
      distrito: "Jesús Nazareno",
      direccionEntrega: "Agencia Shalom Ayacucho",
      metodoEntrega: "delivery",
    });
  });

  it("bloquea el botón mientras se registra el pedido", () => {
    render(
      <CheckoutForm
        datos={{ metodoEntrega: "recojo" }}
        errores={{}}
        enviando
        total={100}
        onCambiar={vi.fn()}
        onEnviar={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /registrando pedido/i })).toBeDisabled();
  });
});

describe("CheckoutForm · buscador de destino y accesibilidad (RF27, RB16)", () => {
  function renderForm(props: Partial<Parameters<typeof CheckoutForm>[0]> = {}) {
    const onCambiar = vi.fn();
    const utils = render(
      <CheckoutForm
        datos={{ metodoEntrega: "delivery" }}
        errores={{}}
        enviando={false}
        total={173}
        onCambiar={onCambiar}
        onEnviar={vi.fn()}
        {...props}
      />,
    );
    return { ...utils, onCambiar };
  }

  it("RB18 · muestra el total del pedido en soles", () => {
    renderForm({ total: 173.5 });
    expect(screen.getByTestId("total-checkout")).toHaveTextContent("S/ 173.50");
  });

  it("el mensaje informativo cambia según el método de entrega (RB12)", () => {
    const { unmount } = renderForm({ datos: { metodoEntrega: "recojo" } });
    expect(screen.getByText(/Yape \/ Plin \/ efectivo/i)).toBeInTheDocument();
    unmount();

    renderForm();
    expect(screen.getByText(/envío nacional por agencia/i)).toBeInTheDocument();
  });

  it("marca los campos con error mediante aria-invalid y aria-describedby", () => {
    renderForm({
      errores: {
        nombre: "Ingresa tu nombre (mínimo 2 caracteres).",
        provincia: "Selecciona una provincia de la lista.",
        direccionEntrega: "Indica una dirección o agencia de transporte.",
      },
    });
    const nombre = screen.getByLabelText(/tu nombre/i);
    expect(nombre).toHaveAttribute("aria-invalid", "true");
    expect(nombre).toHaveAttribute("aria-describedby", "error-nombre");
    expect(screen.getByLabelText(/provincia/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/dirección o agencia/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("el distrito está deshabilitado hasta elegir una provincia válida", () => {
    const { unmount } = renderForm();
    const distrito = screen.getByLabelText(/distrito/i);
    expect(distrito).toBeDisabled();
    expect(distrito).toHaveAttribute("placeholder", "Selecciona provincia primero");
    unmount();

    renderForm({ datos: { metodoEntrega: "delivery", provincia: "Ayacucho" } });
    const habilitado = screen.getByLabelText(/distrito/i);
    expect(habilitado).toBeEnabled();
    expect(habilitado).toHaveAttribute("placeholder", "Selecciona tu distrito");
  });

  it("el desplegable ofrece como máximo 7 sugerencias al enfocar", async () => {
    renderForm();
    await userEvent.click(screen.getByLabelText(/provincia/i));
    expect(await screen.findAllByRole("option")).toHaveLength(7);
  });

  it("filtrar sin tildes encuentra la provincia acentuada", async () => {
    const { onCambiar } = renderForm({ datos: { metodoEntrega: "delivery", provincia: "ancash" } });
    await userEvent.click(screen.getByLabelText(/provincia/i));
    const opcion = await screen.findByRole("option", { name: "Áncash" });
    await userEvent.click(opcion);
    expect(onCambiar).toHaveBeenCalledWith("provincia", "Áncash");
  });

  it("sin coincidencias muestra 'Sin resultados.'", async () => {
    renderForm({ datos: { metodoEntrega: "delivery", provincia: "Atlantis" } });
    await userEvent.click(screen.getByLabelText(/provincia/i));
    expect(await screen.findByText("Sin resultados.")).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("la opción ya seleccionada se marca con aria-selected", async () => {
    renderForm({ datos: { metodoEntrega: "delivery", provincia: "Cusco" } });
    await userEvent.click(screen.getByLabelText(/provincia/i));
    expect(await screen.findByRole("option", { name: "Cusco" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("los distritos ofrecidos corresponden a la provincia elegida", async () => {
    renderForm({ datos: { metodoEntrega: "delivery", provincia: "Ayacucho" } });
    await userEvent.click(screen.getByLabelText(/distrito/i));
    const opciones = (await screen.findAllByRole("option")).map((o) => o.textContent);
    expect(opciones).toContain("Jesús Nazareno");
    expect(opciones).not.toContain("Miraflores"); // es de Lima
  });

  it("el método de entrega se expone como radiogroup accesible", () => {
    renderForm();
    expect(screen.getByRole("radiogroup", { name: /método de entrega/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /delivery/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /recojo en tienda/i })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("con recojo no se piden los campos de destino nacional", () => {
    renderForm({ datos: { metodoEntrega: "recojo" } });
    expect(screen.queryByLabelText(/provincia/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/distrito/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/dirección o agencia/i)).not.toBeInTheDocument();
  });

  it("enviar el formulario no recarga la página (submit controlado)", async () => {
    const onEnviar = vi.fn();
    renderForm({ datos: { metodoEntrega: "recojo" }, onEnviar });
    await userEvent.click(screen.getByRole("button", { name: /enviar pedido por whatsapp/i }));
    expect(onEnviar).toHaveBeenCalledOnce();
  });
});
