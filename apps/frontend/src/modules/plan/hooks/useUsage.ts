import { useState, useEffect, useCallback } from "react";
// Certifique-se de que o caminho abaixo está correto para o seu usage.service
import { usageService, UsageSummary } from "../services/usage.service"; 

export function useUsage() {
  // ... resto do código que você já tem
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usageService.getSummary();
      setUsage(data);
    } catch (error) {
      setUsage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Cálculos derivados
  const percent = usage && !usage.unlimited
    ? Math.min(100, Math.round((usage.current / usage.limit) * 100))
    : 0;

  const isNearLimit = !usage?.unlimited && percent >= 80;
  const isAtLimit   = !usage?.unlimited && usage != null && usage.current >= usage.limit;

  return { 
    usage, 
    loading, 
    percent, 
    isNearLimit, 
    isAtLimit,
    refresh // Útil para recarregar após uma ação
  };
}