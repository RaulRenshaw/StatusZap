/**
 * admin.service.ts — Admin API calls.
 *
 * Backend contract:
 *   GET /admin/metrics  → AdminMetrics
 *   GET /admin/accounts → AdminAccount[]
 */
import { request } from "@/shared/services/http";
import type { AdminAccount, AdminMetrics } from "@/modules/admin/types";

export const adminService = {
  getMetrics: () => request<AdminMetrics>("/admin/metrics"),
  getAccounts: () => request<AdminAccount[]>("/admin/accounts"),
};
