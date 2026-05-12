/**
 * UpgradeBanner — shown only to free users.
 * Appears once per session, dismissible, non-blocking.
 */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePlan } from "@/modules/subscription/hooks/usePlan";
import { Zap, X } from "lucide-react";

const DISMISSED_KEY = "sr:banner_dismissed";

export function UpgradeBanner() {
  const { isFree } = usePlan();
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isFree) return;
    if (location.pathname === "/assinar") return;
    if (!sessionStorage.getItem(DISMISSED_KEY)) setVisible(true);
  }, [isFree, location.pathname]);

  function dismiss(e: React.MouseEvent) {
    e.stopPropagation();
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="banner"
      onClick={() => navigate("/assinar")}
      className="group relative flex cursor-pointer items-center gap-3 border-b border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-4 py-2.5 transition-colors hover:bg-primary/15"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
        <Zap className="h-3.5 w-3.5 text-primary" />
      </div>
      <p className="flex-1 text-xs font-medium text-foreground/80">
        <span className="font-semibold text-primary">Plano Grátis</span>
        {" "}— Faça upgrade para recursos ilimitados por{" "}
        <span className="font-semibold">R$ 29/mês</span>.
        <span className="ml-1.5 underline decoration-dotted group-hover:text-primary">
          Saiba mais →
        </span>
      </p>
      <button
        onClick={dismiss}
        aria-label="Fechar"
        className="ml-1 shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
