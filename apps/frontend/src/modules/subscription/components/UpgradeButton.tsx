/**
 * UpgradeButton — compact CTA for nav/sidebar.
 * Shown in header (desktop) and bottom nav (mobile) for free users.
 */
import { useNavigate } from "react-router-dom";
import { usePlan } from "@/modules/subscription/hooks/usePlan";
import { Zap } from "lucide-react";
import { cn } from "@/shared/utils/utils";

interface Props {
  variant?: "header" | "nav";
  className?: string;
}

export function UpgradeButton({ variant = "header", className }: Props) {
  const { isFree } = usePlan();
  const navigate = useNavigate();

  if (!isFree) return null;

  if (variant === "nav") {
    return (
      <button
        onClick={() => navigate("/assinar")}
        className={cn(
          "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-primary transition-colors",
          className
        )}
      >
        <div className="relative">
          <Zap className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-2 w-2 items-center justify-center rounded-full bg-primary" />
        </div>
        Premium
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate("/assinar")}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10",
        className
      )}
    >
      <Zap className="h-3.5 w-3.5" />
      Upgrade
    </button>
  );
}
