/**
 * admin/types.ts — matches backend AdminMetricsDTO and AdminAccountDTO
 */

export interface AdminMetrics {
  totalAccounts: number;
  activeAccounts: number;
  ordersLast30Days: number;
  totalOrders: number;
}

export interface AdminAccount {
  id: string;
  email: string;
  shopName?: string;
  role: "USER" | "ADMIN";
  orderCount: number;
}
