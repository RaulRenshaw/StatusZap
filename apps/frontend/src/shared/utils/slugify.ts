/** Converte uma string para formato slug (URL-safe) */
export function slugify(input: string): string {
  if (!input?.trim()) return "loja";
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 40) || "loja";
}
