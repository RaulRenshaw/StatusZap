import { useCallback, useEffect, useState } from "react";
import { subscriptionService } from "@/modules/subscription/services/subscription.service";
import type { Subscription, SubscriptionConfig } from "@/modules/subscription/types";
import { getErrorMessage } from "@/shared/utils/errors";

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [config, setConfig] = useState<SubscriptionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [sub, cfg] = await Promise.all([
        subscriptionService.getMe(),
        subscriptionService.getConfig(),
      ]);
      setSubscription(sub);
      setConfig(cfg);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Poll after returning from Mercado Pago (URL contains ?subscriptionReturn)
  useEffect(() => {
    if (!window.location.search.includes("subscriptionReturn")) return;
    // Poll up to 5x with 2s interval waiting for webhook to confirm
    let tries = 0;
    const id = setInterval(() => {
      tries++;
      refresh(true);
      if (tries >= 5) clearInterval(id);
    }, 2000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const subscribe = useCallback(async () => {
    setActionLoading(true);
    setError(null);

    try {

      const res = await subscriptionService.checkout();

      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }

      await refresh(true);

    } catch (e) {

      setError(getErrorMessage(e));

    } finally {

      setActionLoading(false);
    }

  }, [refresh]);

  const cancelSubscription = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await subscriptionService.cancel();
      setSubscription(updated);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  }, []);

  const isPremium = subscription?.accountPlan === "premium" &&
    subscription?.status === "authorized";

  const isPending = subscription?.status === "pending";
  const isCanceled = subscription?.status === "canceled";
  const isPastDue = subscription?.status === "past_due";

  return {
    subscription,
    config,
    loading,
    actionLoading,
    error,
    isPremium,
    isPending,
    isCanceled,
    isPastDue,
    subscribe,
    cancelSubscription,
    refresh,
  };
}
