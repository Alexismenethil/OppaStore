import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductGrid } from "@/components/ProductGrid";
import { filtrarProductos } from "@/domain/catalog";
import { alternarFavorito } from "@/domain/favorites";
import { producto } from "../domain/fixtures";
import type { Producto } from "@/domain/types";

const CATALOGO: Producto[] = [
  producto({ id: "1", slug: "serum", nombre: "Serum Centella", categoria: "skincare", stock: 20 }),
  producto({ id: "2", slug: "panda", nombre: "Peluche Panda", categoria: "peluches", stock: 4 }),
  producto({ id: "3", slug: "snack", nombre: "Snack Honey", categoria: "snacks", stock: 0 }),
];

describe("ProductGrid (RF11, RF14–RF17)", () => {
  it("renderiza una tarjeta por producto recibido", () => {
    render(<ProductGrid productos={CATALOGO} />);
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText("Serum Centella")).toBeInTheDocument();
    expect(screen.getByText("Peluche Panda")).toBeInTheDocument();
  });

  it("una lista vacía no renderiza ninguna tarjeta (el vacío lo maneja la vista)", () => {
    render(<ProductGrid productos={[]} />);
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });

  it("propaga el producto pulsado a onAgregar", async () => {
    const onAgregar = vi.fn();
    render(<ProductGrid productos={CATALOGO} onAgregar={onAgregar} />);
    const botones = screen.getAllByRole("button", { name: "Agregar al carrito" });
    await userEvent.click(botones[1]);
    expect(onAgregar).toHaveBeenCalledWith(expect.objectContaining({ id: "2" }));
  });

  it("CP05 · el producto agotado se muestra pero con el botón deshabilitado", () => {
    render(<ProductGrid productos={CATALOGO} onAgregar={vi.fn()} />);
    expect(screen.getByText("Snack Honey")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Producto agotado" })).toBeDisabled();
    // Solo los dos comprables ofrecen el botón activo.
    expect(screen.getAllByRole("button", { name: "Agregar al carrito" })).toHaveLength(2);
  });

  it("sin onFavorito no dibuja el corazón de favoritos", () => {
    render(<ProductGrid productos={CATALOGO} />);
    expect(screen.queryAllByRole("button", { name: "Guardar en favoritos" })).toHaveLength(0);
  });

  it("CP12 · marca como favoritos solo los ids recibidos y alterna sin duplicar (RB08)", async () => {
    function Harness() {
      const [favoritos, setFavoritos] = useState<string[]>(["1"]);
      return (
        <>
          <ProductGrid
            productos={CATALOGO}
            favoritos={favoritos}
            onFavorito={(p) => setFavoritos((prev) => alternarFavorito(prev, p.id))}
          />
          <output data-testid="favoritos">{favoritos.join(",")}</output>
        </>
      );
    }
    render(<Harness />);
    const corazones = screen.getAllByRole("button", { name: "Guardar en favoritos" });
    expect(corazones[0]).toHaveAttribute("aria-pressed", "true");
    expect(corazones[1]).toHaveAttribute("aria-pressed", "false");

    const user = userEvent.setup();
    await user.click(corazones[1]);
    expect(screen.getByTestId("favoritos")).toHaveTextContent("1,2");
    await user.click(corazones[1]); // alternar de vuelta
    expect(screen.getByTestId("favoritos")).toHaveTextContent("1");
  });

  it("CP02 · al cambiar el filtro la grilla refleja el nuevo subconjunto", async () => {
    function Harness() {
      const [categoria, setCategoria] = useState("todos");
      return (
        <>
          <button onClick={() => setCategoria("peluches")}>Filtrar peluches</button>
          <ProductGrid productos={filtrarProductos(CATALOGO, { categoria })} />
        </>
      );
    }
    render(<Harness />);
    expect(screen.getAllByRole("article")).toHaveLength(3);

    await userEvent.click(screen.getByRole("button", { name: "Filtrar peluches" }));
    // AnimatePresence mantiene las tarjetas salientes hasta terminar su animación.
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(1));
    expect(screen.getByText("Peluche Panda")).toBeInTheDocument();
    expect(screen.queryByText("Serum Centella")).not.toBeInTheDocument();
  });

  it("cada tarjeta enlaza al detalle por slug (RF18)", () => {
    render(<ProductGrid productos={CATALOGO} />);
    expect(screen.getByRole("link", { name: "Ver Serum Centella" })).toHaveAttribute(
      "href",
      "/producto/serum",
    );
  });
});
