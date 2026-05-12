import { useCallback, useEffect, useState } from "react";
import { Service } from "@/modules/orders/types";
import { orderService } from "@/modules/orders/services/order.service";
import { getErrorMessage } from "@/shared/utils/errors";

export function useService(id: string | undefined) {
  const [service, setService] = useState<Service | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) {
      setService(undefined);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await orderService.get(id);
      setService(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  return { service, loading, error, refresh, setService };
}
