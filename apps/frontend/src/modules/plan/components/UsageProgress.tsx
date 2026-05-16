/**
 * UsageProgress — mostra uso de ordens ativas com barra de progresso.
 * Aparece somente para usuários FREE quando >= 50% do limite.
 * Cria pressão natural de upgrade.
 */
import { useNavigate } from "react-router-dom";
import { usePlan } from "@/modules/subscription/hooks/usePlan";
import { useUsage } from "@/modules/plan/hooks/useUsage";
import { Zap } from "lucide-react";
import { cn } from "@/shared/utils/utils";

export function UsageProgress() {
  const { isFree } = usePlan();
  const { usage, loading, percent, isNearLimit, isAtLimit } = useUsage();
  const navigate = useNavigate();

  // Só mostra para FREE quando >= 50% de uso
  if (!isFree || loading || !usage || percent < 50) return null;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        isAtLimit
          ? "border-destructive/40 bg-destructive/5"
          : isNearLimit
          ? "border-orange-200 bg-orange-50"
          : "border-border bg-card"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <p className={cn(
          "text-sm font-medium",
          isAtLimit ? "text-destructive" : isNearLimit ? "text-orange-700" : "text-foreground"
        )}>
          {isAtLimit
            ? "Limite de ordens atingido"
            : "Ordens ativas"}
        </p>
        <span className={cn(
          "text-sm font-semibold tabular-nums",
          isAtLimit ? "text-destructive" : isNearLimit ? "text-orange-700" : "text-muted-foreground"
        )}>
          {usage.current} / {usage.limit}
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isAtLimit ? "bg-destructive" : isNearLimit ? "bg-orange-400" : "bg-primary"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* CTA de upgrade */}
      <p className="mt-2 text-xs text-muted-foreground">
        {isAtLimit ? (
          <>
            Você atingiu o limite do plano gratuito.{" "}
            <button
              onClick={() => navigate("/assinar")}
              className="font-semibold text-primary underline decoration-dotted hover:no-underline"
            >
              Faça upgrade para ordens ilimitadas →
            </button>
          </>
        ) : (
          <>
            Restam {usage.limit - usage.current} ordens no plano gratuito.{" "}
            <button
              onClick={() => navigate("/assinar")}
              className="font-semibold text-primary underline decoration-dotted hover:no-underline"
            >
              Upgrade para ilimitado
            </button>
          </>
        )}
      </p>
    </div>
  );
}
