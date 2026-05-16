/**
 * useFeatures — verifica features disponíveis baseado no plano do usuário.
 *
 * Features do plano FREE: FILE_UPLOADS apenas
 * Features do plano PREMIUM: tudo
 *
 * Mantido em sync com backend PlanCapabilities.java
 */
import { useMemo } from "react";
import { usePlan } from "@/modules/subscription/hooks/usePlan";

export type Feature =
  | "UNLIMITED_ORDERS"
  | "TEAM_MEMBERS"
  | "CUSTOM_BRANDING"
  | "ADVANCED_ANALYTICS"
  | "WHATSAPP_AUTOMATION"
  | "FILE_UPLOADS"
  | "API_ACCESS";

const PREMIUM_FEATURES: Set<Feature> = new Set([
  "UNLIMITED_ORDERS",
  "TEAM_MEMBERS",
  "CUSTOM_BRANDING",
  "ADVANCED_ANALYTICS",
  "WHATSAPP_AUTOMATION",
  "FILE_UPLOADS",
  "API_ACCESS",
]);

const FREE_FEATURES: Set<Feature> = new Set([
  "FILE_UPLOADS",
]);

export function useFeatures() {
  const { isPremium } = usePlan();

  const hasFeature = useMemo(() => {
    const activeFeatures = isPremium ? PREMIUM_FEATURES : FREE_FEATURES;
    return (feature: Feature) => activeFeatures.has(feature);
  }, [isPremium]);

  return { hasFeature };
}
