import { useEffect, useState } from "react";
import { adminService } from "@/modules/admin/services/admin.service";
import type { AdminAccount, AdminMetrics } from "@/modules/admin/types";
import { getErrorMessage } from "@/shared/utils/errors";

export function useAdmin() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminService.getMetrics(), adminService.getAccounts()])
      .then(([m, a]) => {
        setMetrics(m);
        setAccounts(a);
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return { metrics, accounts, loading, error };
}
