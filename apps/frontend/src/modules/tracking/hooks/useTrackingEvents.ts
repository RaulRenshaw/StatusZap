import { useEffect, useRef } from "react";
import { createSSEConnection } from "@/shared/services/sse";
import type { OrderUpdatedEvent } from "@/shared/types/api.types";

interface Props {
  token: string;
  onStatusChanged: (event: OrderUpdatedEvent) => void;
}

export function useTrackingEvents({ token, onStatusChanged }: Props) {
  // Stable ref to avoid re-creating SSE on every render
  const callbackRef = useRef(onStatusChanged);
  callbackRef.current = onStatusChanged;

  useEffect(() => {
    if (!token) return;

    // Path within the API — sse.ts prepends API_BASE
    const connection = createSSEConnection(`/public/stream/${token}`);

    connection.source.addEventListener("status-changed", (event: MessageEvent) => {
      try {
        const payload: OrderUpdatedEvent = JSON.parse(event.data);
        callbackRef.current(payload);
      } catch (e) {
        console.error("[SSE] Failed to parse status-changed event", e);
      }
    });

    // Suppress noisy error logs for expected reconnects
    connection.source.onerror = () => {};

    return () => connection.close();
  }, [token]); // Only recreate when token changes
}
