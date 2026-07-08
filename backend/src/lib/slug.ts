/** Convierte un texto a slug URL-safe (minúsculas, sin tildes, guiones). RF43. */
export function generarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita tildes/diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
