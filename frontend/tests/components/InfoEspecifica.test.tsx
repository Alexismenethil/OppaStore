import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InfoEspecifica } from "@/components/InfoEspecifica";
import { producto } from "../domain/fixtures";

describe("InfoEspecifica (RF19, CP18)", () => {
  it("CP18 · skincare: muestra tipo de piel, modo de uso, advertencia y vencimiento", () => {
    render(
      <InfoEspecifica
        producto={producto({
          tipo: "skincare",
          fechaVencimiento: "2027-03-01",
          infoAdicional: {
            tipoPiel: "Piel sensible",
            modoUso: "2 gotas mañana y noche",
            advertencia: "Uso externo",
          },
        })}
      />,
    );
    expect(screen.getByText("Tipo de piel")).toBeInTheDocument();
    expect(screen.getByText("Piel sensible")).toBeInTheDocument();
    expect(screen.getByText("Modo de uso")).toBeInTheDocument();
    expect(screen.getByText("Advertencia")).toBeInTheDocument();
    expect(screen.getByText("Vence el")).toBeInTheDocument();
    expect(screen.getByText("1 de marzo de 2027")).toBeInTheDocument();
  });

  it("CP18 · snack: muestra vencimiento y alérgenos, no datos de skincare", () => {
    render(
      <InfoEspecifica
        producto={producto({
          tipo: "snack",
          fechaVencimiento: "2026-11-30",
          infoAdicional: { alergenos: "Contiene gluten y soya" },
        })}
      />,
    );
    expect(screen.getByText("Alérgenos")).toBeInTheDocument();
    expect(screen.getByText("Contiene gluten y soya")).toBeInTheDocument();
    expect(screen.getByText("Vence el")).toBeInTheDocument();
    expect(screen.queryByText("Tipo de piel")).not.toBeInTheDocument();
  });

  it("CA04 · preventa: muestra la fecha estimada de llegada", () => {
    render(
      <InfoEspecifica
        producto={producto({ tipo: "drop", esPreventa: true, fechaEstimadaLlegada: "2026-08-30" })}
      />,
    );
    expect(screen.getByText("Llegada estimada")).toBeInTheDocument();
    expect(screen.getByText("30 de agosto de 2026")).toBeInTheDocument();
  });

  it("no renderiza nada cuando no hay info específica", () => {
    const { container } = render(
      <InfoEspecifica producto={producto({ infoAdicional: undefined, fechaVencimiento: undefined })} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
