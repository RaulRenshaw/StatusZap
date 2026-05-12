import { useCallback, useEffect, useState } from "react";
import { Service } from "@/modules/orders/types";
import { orderService } from "@/modules/orders/services/order.service";
import { getErrorMessage } from "@/shared/utils/errors";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await orderService.list();
      setServices(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { services, loading, error, refresh };
}
