import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DetalleProducto } from "@/features/catalog/ProductoDetalle";
import { renderConProviders } from "../utils";
import { producto } from "../domain/fixtures";

describe("DetalleProducto (RF18–RF21)", () => {
  it("RF18 · muestra nombre, precio y disponibilidad", () => {
    renderConProviders(
      <DetalleProducto producto={producto({ nombre: "Serum Glow", precio: 92, stock: 8 })} />,
    );
    expect(screen.getByRole("heading", { name: "Serum Glow" })).toBeInTheDocument();
    expect(screen.getByText("S/ 92.00")).toBeInTheDocument();
    expect(screen.getByTestId("disponibilidad")).toHaveTextContent("8 unidad(es) disponible(s)");
  });

  it("CP06 · el selector de cantidad no supera el stock (RF21, RB01, RB07)", async () => {
    renderConProviders(<DetalleProducto producto={producto({ stock: 2 })} />);
    const mas = screen.getByRole("button", { name: /aumentar cantidad/i });
    expect(screen.getByRole("button", { name: /disminuir cantidad/i })).toBeDisabled(); // arranca en 1
    await userEvent.click(mas); // -> 2
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("2");
    expect(mas).toBeDisabled(); // no supera el stock
  });

  it("CP05 · producto agotado: sin selector y botón 'Agotado' deshabilitado", () => {
    renderConProviders(<DetalleProducto producto={producto({ stock: 0 })} />);
    expect(screen.getByRole("button", { name: /producto agotado/i })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /aumentar cantidad/i })).not.toBeInTheDocument();
  });

  it("CP04 · agregar al carrito muestra confirmación (RF20)", async () => {
    renderConProviders(<DetalleProducto producto={producto({ nombre: "Tónico", stock: 5 })} />);
    await userEvent.click(screen.getByRole("button", { name: /agregar al carrito/i }));
    expect(await screen.findByText(/agregado al carrito/i)).toBeInTheDocument();
  });
});
