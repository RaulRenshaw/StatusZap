/**
 * order.service.ts — API calls for service orders.
 *
 * Backend contract (OrderResponseDTO):
 *   id, userId, publicToken, customerName, customerPhone,
 *   device, observations, status, createdAt, updatedAt,
 *   estimatedReadyAt?, priceInCents?, history[]
 *
 * The backend uses "observations" as the unified description field.
 * The frontend form splits it into "problem" + "observations" visually,
 * but sends both merged as observations to the backend.
 */

import { request } from "@/shared/services/http";
import { Service, ServiceStatus } from "@/modules/orders/types";

export interface CreateOrderBody {
  customerName: string;
  customerPhone: string;
  device: string;
  observations?: string;
  estimatedReadyAt?: string;
  priceInCents?: number;
}

export interface UpdateOrderBody {
  customerName?: string;
  customerPhone?: string;
  device?: string;
  observations?: string;
  estimatedReadyAt?: string;
  priceInCents?: number;
}

export interface UpdateStatusBody {
  status: ServiceStatus;
  note?: string;
}

function mapIn(raw: any): Service {
  return {
    id: raw.id,
    userId: raw.userId,
    publicToken: raw.publicToken,
    customerName: raw.customerName,
    customerPhone: raw.customerPhone,
    device: raw.device,
    observations: raw.observations,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    estimatedReadyAt: raw.estimatedReadyAt ?? undefined,
    priceInCents: raw.priceInCents ?? undefined,
    history: (raw.history ?? []).map((e: any) => ({
      status: e.status,
      at: e.at,
      note: e.note ?? undefined,
    })),
  };
}

export const orderService = {
  list(): Promise<Service[]> {
    return request<any[]>("/orders").then((arr) => arr.map(mapIn));
  },

  get(id: string): Promise<Service> {
    return request<any>(`/orders/${id}`).then(mapIn);
  },

  create(body: CreateOrderBody): Promise<Service> {
    return request<any>("/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }).then(mapIn);
  },

  update(id: string, body: UpdateOrderBody): Promise<Service> {
    return request<any>(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then(mapIn);
  },

  setStatus(id: string, status: ServiceStatus, note?: string): Promise<Service> {
    return request<any>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note } satisfies UpdateStatusBody),
    }).then(mapIn);
  },

  remove(id: string): Promise<void> {
    return request<void>(`/orders/${id}`, { method: "DELETE" });
  },
};
