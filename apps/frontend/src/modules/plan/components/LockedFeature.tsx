/**
 * LockedFeature — wrapper que mostra feature mas trava interação para FREE.
 *
 * NÃO esconde a feature — mostra ela, explica o benefício e trava o click.
 *
 * Uso:
 *   <LockedFeature feature="WHATSAPP_AUTOMATION" label="WhatsApp Automático">
 *     <WhatsAppToggle ... />
 *   </LockedFeature>
 */
import { useNavigate } from "react-router-dom";
import { useFeatures, type Feature } from "@/modules/plan/hooks/useFeatures";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Lock } from "lucide-react";

interface LockedFeatureProps {
  feature: Feature;
  label?: string;
  children: React.ReactNode;
}

export function LockedFeature({ feature, label, children }: LockedFeatureProps) {
  const { hasFeature } = useFeatures();
  const navigate = useNavigate();

  if (hasFeature(feature)) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="relative cursor-pointer"
          onClick={() => navigate("/assinar")}
        >
          {/* Conteúdo com opacity reduzida */}
          <div className="pointer-events-none opacity-50 select-none">
            {children}
          </div>
          {/* Ícone de lock */}
          <div className="absolute inset-0 flex items-center justify-end pr-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">
          {label ?? "Recurso"} disponível no <span className="font-semibold">Plano Premium</span>. Clique para upgrade.
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
