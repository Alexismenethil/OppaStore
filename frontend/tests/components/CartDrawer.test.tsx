import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartDrawer } from "@/components/CartDrawer";
import { actualizarCantidad, eliminarItem } from "@/domain/cart";
import type { ItemCarrito, Producto } from "@/domain/types";

function producto(overrides: Partial<Producto> = {}): Producto {
  return {
    id: "x1",
    slug: "x",
    nombre: "Producto X",
    descripcion: "desc",
    precio: 10,
    stock: 10,
    categoria: "skincare",
    tipo: "general",
    activo: true,
    esPreventa: false,
    ...overrides,
  };
}

/** Harness stateful: integra el drawer con las funciones puras del dominio. */
function Harness({ inicial }: { inicial: ItemCarrito[] }) {
  const [items, setItems] = useState(inicial);
  return (
    <CartDrawer
      abierto
      items={items}
      onCerrar={vi.fn()}
      onIncrementar={(i) => setItems((prev) => actualizarCantidad(prev, i.producto.id, i.cantidad + 1))}
      onDecrementar={(i) => setItems((prev) => actualizarCantidad(prev, i.producto.id, i.cantidad - 1))}
      onEliminar={(i) => setItems((prev) => eliminarItem(prev, i.producto.id))}
      onContinuar={vi.fn()}
    />
  );
}

describe("CartDrawer (RF22–RF27)", () => {
  it("CP07 · el total se actualiza al aumentar la cantidad (RB04, RB05)", async () => {
    const p = producto({ id: "a", nombre: "Tónico", precio: 65, stock: 10 });
    render(<Harness inicial={[{ producto: p, cantidad: 1 }]} />);

    expect(screen.getByTestId("total-carrito")).toHaveTextContent("S/ 65.00");
    await userEvent.click(screen.getByRole("button", { name: /aumentar cantidad de tónico/i }));
    expect(screen.getByTestId("total-carrito")).toHaveTextContent("S/ 130.00");
  });

  it("CP06 · el botón + se deshabilita al llegar al stock (RB01)", () => {
    const p = producto({ id: "a", nombre: "Snack", precio: 12, stock: 2 });
    render(<Harness inicial={[{ producto: p, cantidad: 2 }]} />);

    expect(screen.getByRole("button", { name: /aumentar cantidad de snack/i })).toBeDisabled();
    expect(screen.getByText(/solo 2 disponible/i)).toBeInTheDocument();
  });

  it("CP06 · el botón − se deshabilita en cantidad 1 (RB07)", () => {
    const p = producto({ id: "a", nombre: "Peluche", stock: 5 });
    render(<Harness inicial={[{ producto: p, cantidad: 1 }]} />);

    expect(screen.getByRole("button", { name: /disminuir cantidad de peluche/i })).toBeDisabled();
  });

  it("CP08 · eliminar quita el producto y muestra el estado vacío", async () => {
    const p = producto({ id: "a", nombre: "Serum", stock: 5 });
    render(<Harness inicial={[{ producto: p, cantidad: 1 }]} />);

    await userEvent.click(screen.getByRole("button", { name: /^eliminar$/i }));
    expect(screen.queryByText("Serum")).not.toBeInTheDocument();
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
  });

  it("CP09 · 'Continuar' avanza al paso de datos del cliente (RF27)", async () => {
    const onContinuar = vi.fn();
    const p = producto({ id: "a", nombre: "Tónico", precio: 65, stock: 5 });
    render(
      <CartDrawer
        abierto
        items={[{ producto: p, cantidad: 1 }]}
        onCerrar={vi.fn()}
        onIncrementar={vi.fn()}
        onDecrementar={vi.fn()}
        onEliminar={vi.fn()}
        onContinuar={onContinuar}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(onContinuar).toHaveBeenCalledOnce();
  });

  it("renderiza el formulario de checkout en el paso 'datos'", () => {
    const p = producto({ id: "a", nombre: "Tónico", stock: 5 });
    render(
      <CartDrawer
        abierto
        paso="datos"
        items={[{ producto: p, cantidad: 1 }]}
        onCerrar={vi.fn()}
        onIncrementar={vi.fn()}
        onDecrementar={vi.fn()}
        onEliminar={vi.fn()}
        onContinuar={vi.fn()}
        onVolver={vi.fn()}
        checkout={<div>Formulario de datos</div>}
      />,
    );
    expect(screen.getByText("Formulario de datos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /volver al carrito/i })).toBeInTheDocument();
  });
});
