import { ServiceStatus, STATUS_LABELS } from "@/modules/orders/types";
import { cn } from "@/shared/utils/utils";
import { StatusIcon } from "@/shared/components/StatusIcon";

const variants: Record<ServiceStatus, string> = {
  recebido: "bg-info/10 text-info border-info/20",
  analise: "bg-[hsl(var(--status-analise)/0.1)] text-[hsl(var(--status-analise))] border-[hsl(var(--status-analise)/0.2)]",
  conserto: "bg-warning/10 text-warning-foreground border-warning/30",
  pronto: "bg-success/10 text-success border-success/30",
  entregue: "bg-muted text-muted-foreground border-border",
};

interface Props {
  status: ServiceStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, size = "md", showIcon = true, className }: Props) {
  const iconSize =
    size === "sm" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-tight",
        variants[status],
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-3.5 py-1.5 text-sm",
        className,
      )}
    >
      {showIcon && <StatusIcon status={status} className={iconSize} />}
      {STATUS_LABELS[status]}
    </span>
  );
}
