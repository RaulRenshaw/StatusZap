import { request } from "@/shared/services/http";
import type {
  Subscription,
  SubscriptionConfig,
  SubscriptionCheckoutResponse,
} from "@/modules/subscription/types";

export const subscriptionService = {
  getConfig: () =>
    request<SubscriptionConfig>("/subscriptions/config"),

  getMe: (): Promise<Subscription | null> =>
    request<Subscription>("/subscriptions/me").catch((e: any) => {
      if (e?.status === 404) return null;
      throw e;
    }),

  checkout: () =>
  request<SubscriptionCheckoutResponse>("/subscriptions/checkout", {
    method: "POST",
  }),

  cancel: () =>
    request<Subscription>("/subscriptions/cancel", { method: "POST" }),
};
