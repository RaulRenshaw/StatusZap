/**
 * usePlan — lightweight plan check.
 *
 * Reads accountPlan from the stored user object without hitting the API.
 * Used by components that just need to know free vs premium.
 * For full subscription details, use useSubscription.
 */
import { useMemo } from "react";
import type { AccountPlan } from "@/modules/subscription/types";

const USER_KEY = "sr:user";

export function usePlan(): { plan: AccountPlan; isFree: boolean; isPremium: boolean } {
  const plan = useMemo<AccountPlan>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return (JSON.parse(raw || "{}")?.accountPlan as AccountPlan) ?? "free";
    } catch {
      return "free";
    }
  }, []);

  return {
    plan,
    isFree: plan === "free",
    isPremium: plan === "premium",
  };
}
