import { ServiceStatus } from "@/modules/orders/types";
import { Inbox, Search, Wrench, CheckCircle2, PackageCheck, LucideIcon } from "lucide-react";
import { cn } from "@/shared/utils/utils";

const ICONS: Record<ServiceStatus, LucideIcon> = {
  recebido: Inbox,
  analise: Search,
  conserto: Wrench,
  pronto: CheckCircle2,
  entregue: PackageCheck,
};

interface Props {
  status: ServiceStatus;
  className?: string;
}

export function StatusIcon({ status, className }: Props) {
  const Icon = ICONS[status];
  return <Icon className={cn("h-4 w-4", className)} aria-hidden />;
}
