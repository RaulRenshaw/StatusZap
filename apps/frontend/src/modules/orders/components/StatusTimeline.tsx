import { ServiceStatus, STATUS_DESCRIPTIONS, STATUS_FLOW, STATUS_LABELS, StatusEvent } from "@/modules/orders/types";
import { cn } from "@/shared/utils/utils";
import { Check } from "lucide-react";
import { formatDate } from "@/shared/utils/format";
import { StatusIcon } from "@/shared/components/StatusIcon";

interface Props {
  current: ServiceStatus;
  history: StatusEvent[];
  variant?: "vertical" | "horizontal";
}

export function StatusTimeline({ current, history, variant = "vertical" }: Props) {
  const currentIdx = STATUS_FLOW.indexOf(current);

  if (variant === "horizontal") {
    return (
      <div className="w-full">
        {/* Linha de círculos + conectores */}
        <div className="flex w-full items-center">
          {STATUS_FLOW.map((s, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s} className="flex flex-1 items-center">
                {i > 0 && (
                  <div
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i <= currentIdx ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    done
                      ? "border-primary bg-primary text-primary-foreground shadow-glow"
                      : "border-border bg-background text-muted-foreground",
                    active && "ring-4 ring-primary/20 animate-pulse-soft",
                  )}
                >
                  {done && !active ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <StatusIcon status={s} className="h-4 w-4" />
                  )}
                </div>
                {i < STATUS_FLOW.length - 1 && (
                  <div
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i < currentIdx ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Labels alinhadas em grid abaixo, garantindo altura uniforme */}
        <div className="mt-2 grid grid-cols-5 gap-1 sm:gap-2">
          {STATUS_FLOW.map((s, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <span
                key={s}
                className={cn(
                  "text-center text-[11px] sm:text-xs font-medium leading-tight",
                  active ? "text-foreground" : done ? "text-foreground/70" : "text-muted-foreground",
                )}
              >
                {STATUS_LABELS[s]}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // vertical — exibe histórico real
  return (
    <ol className="relative space-y-6 border-l-2 border-border pl-6">
      {[...history].reverse().map((event, i) => {
        const isLatest = i === 0;
        return (
          <li key={`${event.status}-${event.at}`} className="relative animate-fade-in">
            <span
              className={cn(
                "absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full border-2",
                isLatest
                  ? "border-primary bg-primary text-primary-foreground shadow-glow"
                  : "border-border bg-background text-muted-foreground",
              )}
            >
              <StatusIcon status={event.status} className="h-3.5 w-3.5" />
            </span>
            <div className={cn("rounded-xl border bg-card p-4 shadow-sm", isLatest && "ring-2 ring-primary/20")}>
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-display font-bold text-foreground">{STATUS_LABELS[event.status]}</h4>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(event.at)}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{event.note || STATUS_DESCRIPTIONS[event.status]}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
