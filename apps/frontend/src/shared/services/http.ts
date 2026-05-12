/**
 * http.ts — HTTP client base
 *
 * Single source of truth for all API requests.
 * Reads API_BASE from VITE_API_URL env var.
 * Handles auth token injection, error parsing, and 401 redirect.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const SESSION_KEY = "sr:session";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly error: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw)?.token ?? null) : null;
  } catch {
    return null;
  }
}

function handleUnauthorized() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("sr:user");
  // Redirect to /auth preserving current path for redirect-back
  const current = window.location.pathname;
  if (current !== "/auth") {
    window.location.href = `/auth?from=${encodeURIComponent(current)}`;
  }
}

export async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 204) return undefined as T;

  // 401 — session expired or invalid → force logout
  if (res.status === 401) {
    handleUnauthorized();
    throw new ApiError(401, "unauthorized", "Sessão expirada. Faça login novamente.");
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error ?? "server_error",
      body?.message ?? `Erro ${res.status}`
    );
  }

  return body as T;
}
