/**
 * sse.ts — Server-Sent Events client
 *
 * Wraps EventSource with automatic reconnect on error.
 * Reads base URL from VITE_API_URL (same as http.ts).
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

export interface SSEConnection {
  source: EventSource;
  close(): void;
}

export function createSSEConnection(path: string): SSEConnection {
  // path should start with /api/... — we use full URL so EventSource
  // goes to the backend regardless of where the front is hosted
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const source = new EventSource(url);

  return {
    source,
    close() {
      source.close();
    },
  };
}
