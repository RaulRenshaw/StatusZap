import { request } from "@/shared/services/http";
import type { Service, ShopProfile } from "@/modules/orders/types";

export interface PublicTrackingResponse {
  order: Service;       // backend uses "order" key now (aligned with OrderResponseDTO)
  profile?: ShopProfile;
}

export const trackingService = {
  getByToken: (token: string) =>
    request<PublicTrackingResponse>(`/public/${token}`),

  getByShortToken: (slug: string, shortToken: string) =>
    request<PublicTrackingResponse>(`/public/${slug}/${shortToken}`),

  getProfileBySlug: (slug: string) =>
    request<ShopProfile>(`/public/profile/${slug}`),
};
