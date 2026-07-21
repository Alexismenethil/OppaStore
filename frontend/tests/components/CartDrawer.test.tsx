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

describe("CartDrawer · apertura, cierre y estado vacío (RF22–RF26)", () => {
  const props = {
    items: [{ producto: producto({ id: "a", nombre: "Tónico", stock: 5 }), cantidad: 1 }],
    onCerrar: vi.fn(),
    onIncrementar: vi.fn(),
    onDecrementar: vi.fn(),
    onEliminar: vi.fn(),
    onContinuar: vi.fn(),
  };

  it("cerrado no renderiza el panel", () => {
    render(<CartDrawer abierto={false} {...props} />);
    expect(screen.queryByRole("dialog", { name: /carrito de compras/i })).not.toBeInTheDocument();
  });

  it("abierto expone un diálogo modal accesible y bloquea el scroll del fondo", () => {
    render(<CartDrawer abierto {...props} />);
    const panel = screen.getByRole("dialog", { name: /carrito de compras/i });
    expect(panel).toHaveAttribute("aria-modal", "true");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("la tecla Escape cierra el carrito", async () => {
    const onCerrar = vi.fn();
    render(<CartDrawer abierto {...props} onCerrar={onCerrar} />);
    await userEvent.keyboard("{Escape}");
    expect(onCerrar).toHaveBeenCalledOnce();
  });

  it("otras teclas no cierran el carrito", async () => {
    const onCerrar = vi.fn();
    render(<CartDrawer abierto {...props} onCerrar={onCerrar} />);
    await userEvent.keyboard("{Enter}");
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it("el botón de cerrar invoca onCerrar", async () => {
    const onCerrar = vi.fn();
    render(<CartDrawer abierto {...props} onCerrar={onCerrar} />);
    await userEvent.click(screen.getByRole("button", { name: /cerrar carrito/i }));
    expect(onCerrar).toHaveBeenCalledOnce();
  });

  it("con el carrito vacío ofrece explorar el catálogo y oculta el total", () => {
    render(<CartDrawer abierto {...props} items={[]} />);
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explorar catálogo/i })).toHaveAttribute(
      "href",
      "/catalogo",
    );
    expect(screen.queryByTestId("total-carrito")).not.toBeInTheDocument();
  });

  it("con el carrito vacío nunca muestra el formulario, aunque el paso sea 'datos'", () => {
    render(
      <CartDrawer abierto {...props} items={[]} paso="datos" checkout={<div>Formulario</div>} />,
    );
    expect(screen.queryByText("Formulario")).not.toBeInTheDocument();
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
  });

  it("RF25 · el total suma todas las líneas en formato S/ (RB04, RB18)", () => {
    render(
      <CartDrawer
        abierto
        {...props}
        items={[
          { producto: producto({ id: "a", nombre: "Tónico", precio: 65, stock: 5 }), cantidad: 2 },
          { producto: producto({ id: "b", nombre: "Snack", precio: 12.5, stock: 5 }), cantidad: 1 },
        ]}
      />,
    );
    expect(screen.getByTestId("total-carrito")).toHaveTextContent("S/ 142.50");
    expect(screen.getByText("S/ 130.00")).toBeInTheDocument(); // subtotal de la línea
  });

  it("sin alcanzar el stock no muestra el aviso de disponibilidad limitada", () => {
    render(<CartDrawer abierto {...props} />);
    expect(screen.queryByText(/solo \d+ disponible/i)).not.toBeInTheDocument();
  });

  it("en el paso 'datos' sin onVolver no dibuja el botón de retroceso", () => {
    render(<CartDrawer abierto {...props} paso="datos" checkout={<div>Formulario</div>} />);
    expect(screen.getByText("Formulario")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /volver al carrito/i })).not.toBeInTheDocument();
  });

  it("restaura el scroll del fondo al cerrarse", () => {
    const { rerender } = render(<CartDrawer abierto {...props} />);
    expect(document.body.style.overflow).toBe("hidden");
    rerender(<CartDrawer abierto={false} {...props} />);
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
