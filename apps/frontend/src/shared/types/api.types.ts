/**
 * api.types.ts — types that mirror backend response shapes.
 *
 * Keep in sync with the backend API contract.
 * Domain types (Service, ShopProfile, etc.) live in each module's types.ts.
 */

export interface ApiErrorBody {
  error: string;
  message: string;
}

export interface OrderUpdatedEvent {
  orderId: string;
  status: string;
  updatedAt: string;
}

export type { OrderUpdatedEvent as ServiceUpdatedEvent }; // backwards compat alias
