/** Extrai mensagem legível de erros desconhecidos */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Erro desconhecido. Tente novamente.";
}
