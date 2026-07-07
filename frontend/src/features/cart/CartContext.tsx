"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ItemCarrito, Producto } from "@/domain/types";
import {
  agregarAlCarrito,
  actualizarCantidad,
  eliminarItem,
  cantidadEnCarrito,
  contarItems,
  totalCarrito,
  validarCantidad,
  type ResultadoValidacion,
} from "@/domain/cart";
import { leerJSON, guardarJSON } from "@/lib/storage";

const CLAVE_STORAGE = "oppastore.carrito.v1";

interface CartContexto {
  items: ItemCarrito[];
  /** Drawer lateral abierto/cerrado. */
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
  /** Agrega validando stock (RB01); devuelve el resultado para mostrar feedback. */
  agregar: (producto: Producto, cantidad?: number) => ResultadoValidacion;
  cambiarCantidad: (productoId: string, cantidad: number) => void;
  eliminar: (productoId: string) => void;
  vaciar: () => void;
  totalUnidades: number;
  total: number;
}

const Contexto = createContext<CartContexto | null>(null);

export function useCart(): CartContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [hidratado, setHidratado] = useState(false);

  // Carga inicial desde localStorage (RB17); se hace tras montar para evitar
  // desajustes de hidratación entre servidor y cliente.
  useEffect(() => {
    setItems(leerJSON<ItemCarrito[]>(CLAVE_STORAGE, []));
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (hidratado) guardarJSON(CLAVE_STORAGE, items);
  }, [items, hidratado]);

  const agregar = useCallback(
    (producto: Producto, cantidad = 1): ResultadoValidacion => {
      const actual = cantidadEnCarrito(items, producto.id);
      const validacion = validarCantidad(producto, actual + cantidad);
      if (!validacion.ok) return validacion;
      setItems((prev) => agregarAlCarrito(prev, producto, cantidad));
      return { ok: true };
    },
    [items],
  );

  const cambiarCantidad = useCallback((productoId: string, cantidad: number) => {
    setItems((prev) => actualizarCantidad(prev, productoId, cantidad));
  }, []);

  const eliminar = useCallback((productoId: string) => {
    setItems((prev) => eliminarItem(prev, productoId));
  }, []);

  const vaciar = useCallback(() => setItems([]), []);
  const abrir = useCallback(() => setAbierto(true), []);
  const cerrar = useCallback(() => setAbierto(false), []);

  const valor = useMemo<CartContexto>(
    () => ({
      items,
      abierto,
      abrir,
      cerrar,
      agregar,
      cambiarCantidad,
      eliminar,
      vaciar,
      totalUnidades: contarItems(items),
      total: totalCarrito(items),
    }),
    [items, abierto, abrir, cerrar, agregar, cambiarCantidad, eliminar, vaciar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
