import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCard } from "@/components/ProductCard";
import type { Producto } from "@/domain/types";

function producto(overrides: Partial<Producto> = {}): Producto {
  return {
    id: "x1",
    slug: "x",
    nombre: "Serum Test",
    descripcion: "desc",
    precio: 92,
    stock: 10,
    categoria: "skincare",
    tipo: "skincare",
    activo: true,
    esPreventa: false,
    ...overrides,
  };
}

describe("ProductCard (RF14–RF17)", () => {
  it("CP05 · producto agotado: etiqueta 'Agotado' y botón deshabilitado", () => {
    render(<ProductCard producto={producto({ stock: 0 })} onAgregar={vi.fn()} />);
    expect(screen.getByTestId("status-badge")).toHaveTextContent("Agotado");
    expect(screen.getByRole("button", { name: /agotado/i })).toBeDisabled();
  });

  it("CP11 · pocas unidades: etiqueta 'Pocas unidades'", () => {
    render(<ProductCard producto={producto({ stock: 3 })} />);
    expect(screen.getByTestId("status-badge")).toHaveTextContent("Pocas unidades");
  });

  it("muestra el precio en formato S/ (RB18)", () => {
    render(<ProductCard producto={producto({ precio: 92 })} />);
    expect(screen.getByText("S/ 92.00")).toBeInTheDocument();
  });

  it("CP04 · agrega un producto disponible al pulsar el botón", async () => {
    const onAgregar = vi.fn();
    render(<ProductCard producto={producto({ stock: 10 })} onAgregar={onAgregar} />);
    await userEvent.click(screen.getByRole("button", { name: /agregar al carrito/i }));
    expect(onAgregar).toHaveBeenCalledOnce();
  });
});
