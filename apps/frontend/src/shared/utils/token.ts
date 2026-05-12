/** Gera um token aleatório para uso em links públicos */
export function genToken(length = 16): string {
  return Array.from({ length }, () =>
    Math.random().toString(36)[2] || "0"
  ).join("");
}
