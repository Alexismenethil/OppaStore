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
