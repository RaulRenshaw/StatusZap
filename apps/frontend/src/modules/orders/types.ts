// ─── Domain types — keep in sync with backend OrderResponseDTO ───────────────

export type ServiceStatus =
  | "recebido"
  | "analise"
  | "conserto"
  | "pronto"
  | "entregue";

export const STATUS_FLOW: ServiceStatus[] = [
  "recebido",
  "analise",
  "conserto",
  "pronto",
  "entregue",
];

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  recebido:  "Recebido",
  analise:   "Em análise",
  conserto:  "Em andamento",
  pronto:    "Pronto",
  entregue:  "Entregue",
};

export const STATUS_DESCRIPTIONS: Record<ServiceStatus, string> = {
  recebido:  "Recebemos seu pedido e já estamos verificando.",
  analise:   "Estamos avaliando o problema.",
  conserto:  "O serviço está em andamento.",
  pronto:    "Seu pedido está pronto para retirada!",
  entregue:  "Pedido entregue. Obrigado!",
};

export interface StatusEvent {
  status: ServiceStatus;
  at: string;     // ISO 8601
  note?: string;
}

export interface Service {
  id: string;
  userId: string;      // owner — added to match backend
  publicToken: string;
  customerName: string;
  customerPhone: string;
  device: string;
  problem?: string;
  observations?: string; // unified field — backend uses observations only
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
  estimatedReadyAt?: string;
  priceInCents?: number;  // renamed from price → priceInCents to match backend
  history: StatusEvent[];
}

export interface ShopProfile {
  name: string;
  slug: string;
  phone: string;
  address?: string;
  logoUrl?: string;
  greeting?: string;
}
