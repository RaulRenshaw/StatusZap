/**
 * profile.service.ts — API calls for shop profile.
 *
 * Backend contract:
 *   GET  /profile              → ProfileResponseDTO
 *   PUT  /profile              → ProfileResponseDTO  (was POST — fixed)
 *   POST /profile/logo         → { logoUrl: string }
 *   GET  /public/profile/:slug → ProfileResponseDTO
 */
import { request } from "@/shared/services/http";
import type { ShopProfile } from "@/modules/orders/types";

export interface ProfileBody {
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  greeting?: string;
}

export const profileService = {
  get: () => request<ShopProfile>("/profile"),

  save: (body: ProfileBody) =>
    request<ShopProfile>("/profile/update", {
      method: "PUT",     // was POST — backend uses PUT
      body: JSON.stringify(body),
    }),

  getPublic: (slug: string) =>
    request<ShopProfile>(`/public/profile/${slug}`),
};
