/**
 * Acceso seguro a localStorage (RB17: persistencia de carrito y favoritos).
 * Falla de forma explícita en consola pero nunca rompe la UI (RNF09).
 */

export function leerJSON<T>(clave: string, porDefecto: T): T {
  if (typeof window === "undefined") return porDefecto;
  try {
    const crudo = window.localStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as T) : porDefecto;
  } catch (err) {
    console.warn(`No se pudo leer "${clave}" de localStorage`, err);
    return porDefecto;
  }
}

export function guardarJSON(clave: string, valor: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch (err) {
    console.warn(`No se pudo guardar "${clave}" en localStorage`, err);
  }
}
