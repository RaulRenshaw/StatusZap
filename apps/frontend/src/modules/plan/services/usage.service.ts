// src/modules/plan/services/usage.service.ts
import { request } from "@/shared/services/http";

export interface UsageSummary {
  type: string;
  current: number;
  limit: number;
  unlimited: boolean;
}

export const usageService = {
  getSummary: () => request<UsageSummary>("/usage/summary"), 
};