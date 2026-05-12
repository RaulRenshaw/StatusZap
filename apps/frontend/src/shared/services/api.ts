/**
 * api.ts — Auth API methods
 *
 * All other domain API calls live inside their own module:
 *   modules/orders/services/order.service.ts
 *   modules/profile/services/profile.service.ts
 *   modules/tracking/services/tracking.service.ts
 */
import { request, ApiError } from "./http";

export { ApiError };

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    shopName?: string;
    roles?: string[];
  };
  session: {
    token: string;
    expiresAt?: string;
  };
}

export const api = {
  login(email: string, password: string) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register(email: string, password: string, shopName?: string) {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, shopName }),
    });
  },

  logout() {
    return request<void>("/auth/logout", { method: "POST" });
  },
};
