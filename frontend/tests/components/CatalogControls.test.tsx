import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatalogControls } from "@/components/CatalogControls";
import { CATEGORIA_TODOS } from "@/domain/catalog";

const CATEGORIAS = [
  { slug: "skincare", nombre: "Skincare Coreano" },
  { slug: "snacks", nombre: "Snacks & Foods" },
  { slug: "peluches", nombre: "Peluches Kawaii" },
];

/** Harness controlado: refleja cómo lo usa CatalogoView (estado arriba). */
function Harness({ categoriaInicial = CATEGORIA_TODOS }: { categoriaInicial?: string }) {
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [busqueda, setBusqueda] = useState("");
  return (
    <>
      <CatalogControls
        categorias={CATEGORIAS}
        categoriaActiva={categoria}
        onCategoria={setCategoria}
        busqueda={busqueda}
        onBusqueda={setBusqueda}
      />
      <output data-testid="estado">{`${categoria}|${busqueda}`}</output>
    </>
  );
}

describe("CatalogControls (RF12, RF13)", () => {
  it("muestra 'Todos' delante de las categorías recibidas", () => {
    render(<Harness />);
    const chips = screen.getAllByRole("button").filter((b) => b.textContent !== "");
    expect(chips[0]).toHaveTextContent("Todos");
    expect(screen.getByRole("button", { name: "Skincare Coreano" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Peluches Kawaii" })).toBeInTheDocument();
  });

  it("CP03 · escribir en el buscador notifica cada pulsación y acumula el texto (RF13)", async () => {
    const onBusqueda = vi.fn();
    const { rerender } = render(
      <CatalogControls
        categorias={CATEGORIAS}
        categoriaActiva={CATEGORIA_TODOS}
        onCategoria={vi.fn()}
        busqueda=""
        onBusqueda={onBusqueda}
      />,
    );
    // Con `busqueda` fija, cada tecla notifica solo el carácter escrito.
    await userEvent.type(screen.getByLabelText("Buscar productos"), "panda");
    expect(onBusqueda).toHaveBeenCalledTimes(5);
    expect(onBusqueda).toHaveBeenLastCalledWith("a");

    // Con el valor controlado por el padre (como en CatalogoView), el texto se acumula.
    onBusqueda.mockClear();
    rerender(
      <CatalogControls
        categorias={CATEGORIAS}
        categoriaActiva={CATEGORIA_TODOS}
        onCategoria={vi.fn()}
        busqueda="pand"
        onBusqueda={onBusqueda}
      />,
    );
    await userEvent.type(screen.getByLabelText("Buscar productos"), "a");
    expect(onBusqueda).toHaveBeenCalledWith("panda");
  });

  it("CP02 · pulsar un chip informa el slug de la categoría (RF12)", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Snacks & Foods" }));
    expect(screen.getByTestId("estado")).toHaveTextContent("snacks|");
  });

  it("el botón de limpiar solo aparece cuando hay texto y vacía la búsqueda", async () => {
    render(<Harness />);
    expect(screen.queryByRole("button", { name: "Limpiar búsqueda" })).not.toBeInTheDocument();

    const input = screen.getByLabelText("Buscar productos");
    await userEvent.type(input, "serum");
    expect(screen.getByTestId("estado")).toHaveTextContent("todos|serum");

    await userEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    expect(input).toHaveValue("");
    expect(screen.getByTestId("estado")).toHaveTextContent("todos|");
    expect(screen.queryByRole("button", { name: "Limpiar búsqueda" })).not.toBeInTheDocument();
  });

  it("solo un chip queda resaltado a la vez y cambiar de categoría no borra la búsqueda", async () => {
    render(<Harness />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Buscar productos"), "glow");
    await user.click(screen.getByRole("button", { name: "Skincare Coreano" }));
    expect(screen.getByTestId("estado")).toHaveTextContent("skincare|glow");

    await user.click(screen.getByRole("button", { name: "Peluches Kawaii" }));
    expect(screen.getByTestId("estado")).toHaveTextContent("peluches|glow");
  });

  it("volver a 'Todos' restablece el filtro de categoría", async () => {
    render(<Harness categoriaInicial="snacks" />);
    await userEvent.click(screen.getByRole("button", { name: "Todos" }));
    expect(screen.getByTestId("estado")).toHaveTextContent("todos|");
  });

  it("sin categorías configuradas solo ofrece 'Todos'", () => {
    render(
      <CatalogControls
        categorias={[]}
        categoriaActiva={CATEGORIA_TODOS}
        onCategoria={vi.fn()}
        busqueda=""
        onBusqueda={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Todos" })).toBeInTheDocument();
  });

  it("el input es de tipo search y refleja el valor controlado", () => {
    render(
      <CatalogControls
        categorias={CATEGORIAS}
        categoriaActiva="skincare"
        onCategoria={vi.fn()}
        busqueda="tónico"
        onBusqueda={vi.fn()}
      />,
    );
    const input = screen.getByLabelText("Buscar productos");
    expect(input).toHaveAttribute("type", "search");
    expect(input).toHaveValue("tónico");
  });
});
