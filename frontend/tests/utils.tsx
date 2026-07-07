import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/features/cart/CartContext";
import { FavoritesProvider } from "@/features/favorites/FavoritesContext";

function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </CartProvider>
    </ToastProvider>
  );
}

/** Renderiza con los contextos globales (carrito, favoritos, toasts). */
export function renderConProviders(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: Providers, ...options });
}
