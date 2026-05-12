// ─── Subscription types — keep in sync with backend ─────────────────────────

export type AccountPlan = "free" | "premium";

export type SubscriptionStatus =
  | "pending"
  | "authorized"
  | "canceled"
  | "past_due";

export interface SubscriptionConfig {
  publicKey: string | null;
  planCode: string;
  amount: number;
  currency: string;
}

export interface SubscriptionCheckoutResponse {
  subscriptionId: string;
  externalReference: string;
  mercadoPagoSubscriptionId: string | null;
  checkoutUrl: string | null;
  status: string;
  accountPlan: AccountPlan;
}

export interface Subscription {
  id: string;
  planCode: string;
  provider: string;
  accountPlan: AccountPlan;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  externalReference: string;
  mercadoPagoPlanId: string | null;
  mercadoPagoSubscriptionId: string | null;
  checkoutUrl: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  nextBillingAt: string | null;
  lastPaymentAt: string | null;
  lastPaymentStatus: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}
