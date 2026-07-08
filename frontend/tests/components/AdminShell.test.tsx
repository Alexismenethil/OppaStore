import type { AnchorHTMLAttributes } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminShell } from "@/features/admin/AdminShell";

const useAuthMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

describe("AdminShell", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("muestra el formulario admin cuando no hay sesión", async () => {
    const iniciarAdmin = vi.fn().mockResolvedValue(undefined);
    useAuthMock.mockReturnValue({
      usuario: null,
      cargando: false,
      autenticado: false,
      iniciarConGoogle: vi.fn(),
      iniciarAdmin,
      cerrarSesion: vi.fn(),
    });

    render(
      <AdminShell>
        <div>panel</div>
      </AdminShell>,
    );

    expect(screen.getByText("Acceso administrador")).toBeInTheDocument();
    expect(screen.queryByText("panel")).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/correo administrador/i), "admin@oppastore.pe");
    await userEvent.type(screen.getByLabelText(/contraseña/i), "Admin12345");
    await userEvent.click(screen.getByRole("button", { name: /entrar al panel/i }));

    expect(iniciarAdmin).toHaveBeenCalledWith("admin@oppastore.pe", "Admin12345");
  });

  it("permite cerrar la sesión cliente antes de entrar al panel", async () => {
    const cerrarSesion = vi.fn();
    useAuthMock.mockReturnValue({
      usuario: {
        id: "u1",
        email: "cliente@oppa.dev",
        nombre: "Cliente",
        avatarUrl: null,
        esAdmin: false,
      },
      cargando: false,
      autenticado: true,
      iniciarConGoogle: vi.fn(),
      iniciarAdmin: vi.fn(),
      cerrarSesion,
    });

    render(
      <AdminShell>
        <div>panel</div>
      </AdminShell>,
    );

    expect(screen.getByText(/tienes una sesión de cliente abierta/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /cerrar sesión actual/i }));
    expect(cerrarSesion).toHaveBeenCalledOnce();
  });

  it("renderiza el panel cuando el usuario sí es admin", () => {
    useAuthMock.mockReturnValue({
      usuario: {
        id: "u2",
        email: "admin@oppastore.pe",
        nombre: "Admin",
        avatarUrl: null,
        esAdmin: true,
      },
      cargando: false,
      autenticado: true,
      iniciarConGoogle: vi.fn(),
      iniciarAdmin: vi.fn(),
      cerrarSesion: vi.fn(),
    });

    render(
      <AdminShell>
        <div>panel</div>
      </AdminShell>,
    );

    expect(screen.getByText("panel")).toBeInTheDocument();
  });
});
