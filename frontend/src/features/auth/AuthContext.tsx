"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ItemCarrito, Producto } from "@/domain/types";
import { fusionarCarritos } from "@/domain/cart";
import { leerJSON } from "@/lib/storage";
import { fetchProductos } from "@/lib/api/products";
import { fetchMe, loginAdmin, urlLoginGoogle, type Usuario } from "@/lib/api/auth";
import {
  getCartRemoto,
  putCartRemoto,
  getFavoritesRemoto,
  putFavoritesRemoto,
  type ItemGuardado,
} from "@/lib/api/sync";
import { useCart } from "@/features/cart/CartContext";
import { useFavorites } from "@/features/favorites/FavoritesContext";

const CLAVE_TOKEN = "oppastore.token.v1";
const CLAVE_CARRITO = "oppastore.carrito.v1";
const CLAVE_FAVORITOS = "oppastore.favoritos.v1";

interface AuthContexto {
  usuario: Usuario | null;
  cargando: boolean;
  autenticado: boolean;
  /** Redirige al flujo real de Google. */
  iniciarConGoogle: (next?: string) => void;
  iniciarAdmin: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => void;
}

const Contexto = createContext<AuthContexto | null>(null);

export function useAuth(): AuthContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

const aGuardado = (items: ItemCarrito[]): ItemGuardado[] =>
  items.map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad }));

/** Reconstruye ItemCarrito a partir del carrito guardado usando el catálogo. */
function resolverItems(guardados: ItemGuardado[], catalogo: Map<string, Producto>): ItemCarrito[] {
  return guardados
    .map((g) => {
      const producto = catalogo.get(g.productoId);
      return producto ? { producto, cantidad: g.cantidad } : null;
    })
    .filter((x): x is ItemCarrito => x !== null);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart();
  const favoritos = useFavorites();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const tokenRef = useRef<string | null>(null);
  const listoSync = useRef(false);

  /**
   * Fusiona el estado de invitado (localStorage) con el guardado en la BD (RB21, CP19)
   * y lo empuja de vuelta. Se lee de localStorage para no depender de la hidratación
   * de los contextos de carrito/favoritos.
   */
  const fusionarConGuardado = useCallback(
    async (token: string) => {
      const invitadoCarrito = leerJSON<ItemCarrito[]>(CLAVE_CARRITO, []);
      const invitadoFavs = leerJSON<string[]>(CLAVE_FAVORITOS, []);

      const [guardadoCarrito, guardadoFavs, catalogo] = await Promise.all([
        getCartRemoto(token).catch(() => [] as ItemGuardado[]),
        getFavoritesRemoto(token).catch(() => [] as string[]),
        fetchProductos().catch(() => [] as Producto[]),
      ]);

      const mapa = new Map(catalogo.map((p) => [p.id, p]));
      const carritoFusion = fusionarCarritos(invitadoCarrito, resolverItems(guardadoCarrito, mapa));
      const favsFusion = [...new Set([...invitadoFavs, ...guardadoFavs])];

      cart.reemplazar(carritoFusion);
      favoritos.reemplazar(favsFusion);

      await Promise.all([
        putCartRemoto(token, aGuardado(carritoFusion)).catch(() => {}),
        putFavoritesRemoto(token, favsFusion).catch(() => {}),
      ]);
    },
    [cart, favoritos],
  );

  const cerrarSesion = useCallback(() => {
    tokenRef.current = null;
    listoSync.current = false;
    if (typeof window !== "undefined") window.localStorage.removeItem(CLAVE_TOKEN);
    setUsuario(null);
  }, []);

  const iniciarConGoogle = useCallback((next?: string) => {
    window.location.href = urlLoginGoogle(next);
  }, []);

  const iniciarAdmin = useCallback(async (email: string, password: string) => {
    const sesion = await loginAdmin(email, password);
    tokenRef.current = sesion.token;
    listoSync.current = true;
    if (typeof window !== "undefined") window.localStorage.setItem(CLAVE_TOKEN, sesion.token);
    setUsuario(sesion.usuario);
    setCargando(false);
  }, []);

  // Arranque: token en el hash (retorno de Google = login nuevo → fusiona) o
  // token guardado (recarga → solo revalida y confía en localStorage).
  useEffect(() => {
    let vigente = true;

    const hashToken = () => {
      const m = /[#&]token=([^&]+)/.exec(window.location.hash);
      if (!m) return null;
      const t = decodeURIComponent(m[1]);
      // En dev, React Strict Mode puede montar el efecto dos veces. Guardamos
      // el token antes de limpiar el hash para no perderlo entre montajes.
      window.localStorage.setItem(CLAVE_TOKEN, t);
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return t;
    };

    const arrancar = async () => {
      const nuevoGoogle = hashToken();
      const token = nuevoGoogle ?? window.localStorage.getItem(CLAVE_TOKEN);
      if (!token) {
        if (vigente) setCargando(false);
        return;
      }
      try {
        const u = await fetchMe(token);
        if (!vigente) return;
        tokenRef.current = token;
        window.localStorage.setItem(CLAVE_TOKEN, token);
        setUsuario(u);
        if (nuevoGoogle && !u.esAdmin) await fusionarConGuardado(token); // login cliente nuevo → fusiona (CP19)
      } catch {
        if (vigente) cerrarSesion();
      } finally {
        if (vigente) {
          listoSync.current = true;
          setCargando(false);
        }
      }
    };

    arrancar();
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistencia continua: empuja el carrito al servidor mientras haya sesión (RF39).
  useEffect(() => {
    if (!usuario || usuario.esAdmin || !listoSync.current || !tokenRef.current) return;
    const token = tokenRef.current;
    const t = setTimeout(() => {
      putCartRemoto(token, aGuardado(cart.items)).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [cart.items, usuario]);

  // Persistencia continua de favoritos (RF37).
  useEffect(() => {
    if (!usuario || usuario.esAdmin || !listoSync.current || !tokenRef.current) return;
    const token = tokenRef.current;
    const t = setTimeout(() => {
      putFavoritesRemoto(token, favoritos.ids).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [favoritos.ids, usuario]);

  return (
    <Contexto.Provider
      value={{
        usuario,
        cargando,
        autenticado: usuario !== null,
        iniciarConGoogle,
        iniciarAdmin,
        cerrarSesion,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}
