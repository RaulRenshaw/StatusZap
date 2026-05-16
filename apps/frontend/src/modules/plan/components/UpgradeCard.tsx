/**
 * UpgradeCard — card de upgrade inline para features travadas.
 *
 * Uso:
 *   <UpgradeCard
 *     feature="ADVANCED_ANALYTICS"
 *     title="Analytics Avançado"
 *     description="Veja métricas de tempo médio de reparo, status mais frequentes e muito mais."
 *   />
 */
import { useNavigate } from "react-router-dom";
import { usePlan } from "@/modules/subscription/hooks/usePlan";
import { useFeatures, type Feature } from "@/modules/plan/hooks/useFeatures";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Lock, Zap } from "lucide-react";

interface UpgradeCardProps {
  feature: Feature;
  title: string;
  description?: string;
  /** Renderiza o conteúdo real se o usuário tiver a feature */
  children?: React.ReactNode;
}

export function UpgradeCard({ feature, title, description, children }: UpgradeCardProps) {
  const { hasFeature } = useFeatures();
  const navigate = useNavigate();

  // Se tem a feature, renderiza o conteúdo normalmente
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // Usuário FREE — mostra card de upgrade
  return (
    <Card className="relative overflow-hidden rounded-2xl border-border p-6 shadow-sm">
      {/* Blur overlay sobre children (preview borrado) */}
      {children && (
        <div className="pointer-events-none absolute inset-0 z-10 backdrop-blur-sm bg-background/60 rounded-2xl" />
      )}
      {children && <div className="opacity-30 pointer-events-none">{children}</div>}

      {/* Lock overlay */}
      <div className={`${children ? "absolute inset-0 z-20" : ""} flex flex-col items-center justify-center gap-4 py-6 text-center`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">{description}</p>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/assinar")}
          className="gap-2 rounded-xl shadow-glow"
        >
          <Zap className="h-4 w-4" />
          Ativar no Premium
        </Button>
      </div>
    </Card>
  );
}
