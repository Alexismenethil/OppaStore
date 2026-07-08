"use client";

import { MotionConfig } from "framer-motion";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/features/cart/CartContext";
import { FavoritesProvider } from "@/features/favorites/FavoritesContext";
import { AuthProvider } from "@/features/auth/AuthContext";
import { CartDrawerHost } from "@/features/cart/CartDrawerHost";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileTabBar } from "@/components/MobileTabBar";

/**
 * Árbol global de la app: estado (carrito/favoritos), toasts, header, drawer,
 * barra móvil y footer. `reducedMotion="user"` respeta la preferencia de
 * accesibilidad del sistema (RNF15).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <CartProvider>
          <FavoritesProvider>
            <AuthProvider>
              <Header />
              {/* pb extra en móvil para no tapar contenido con la tab bar */}
              <div className="pb-20 md:pb-0">{children}</div>
              <Footer />
              <CartDrawerHost />
              <MobileTabBar />
            </AuthProvider>
          </FavoritesProvider>
        </CartProvider>
      </ToastProvider>
    </MotionConfig>
  );
}
