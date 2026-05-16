import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useServices } from "@/modules/orders/hooks/useServices";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { ServiceStatus, STATUS_FLOW, STATUS_LABELS } from "@/modules/orders/types";
import { PlusCircle, Search, Smartphone, Phone, ArrowRight, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { timeAgo } from "@/shared/utils/format";
import { UsageProgress } from "@/modules/plan/components/UsageProgress";
import { useUsage } from "@/modules/plan/hooks/useUsage";
import { usePlan } from "@/modules/subscription/hooks/usePlan";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

const FILTERS: { key: "todos" | ServiceStatus; label: string }[] = [
  { key: "todos", label: "Todos" },
  ...STATUS_FLOW.map((s) => ({ key: s, label: STATUS_LABELS[s] })),
];

export default function Dashboard() {
  const { services, loading } = useServices();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("todos");

  const { isFree } = usePlan();
  const { isAtLimit } = useUsage();
  const canCreate = !isFree || !isAtLimit;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      if (filter !== "todos" && s.status !== filter) return false;
      if (!q) return true;
      return (
        s.customerName.toLowerCase().includes(q) ||
        s.device.toLowerCase().includes(q) ||
        s.customerPhone.includes(q) ||
        (s.problem ?? s.observations ?? "").toLowerCase().includes(q)
      );
    });
  }, [services, query, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: services.length };
    STATUS_FLOW.forEach((s) => (c[s] = services.filter((x) => x.status === s).length));
    return c;
  }, [services]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero / quick action */}
      <div className="overflow-hidden rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-elevated md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold md:text-3xl">Bom te ver por aqui</h1>
            <p className="mt-1 text-sm text-primary-foreground/85 md:text-base">
              Cadastre um serviço em 30 segundos e mande o link pro cliente no WhatsApp.
            </p>
          </div>

          {canCreate ? (
            <Button
              size="lg"
              onClick={() => navigate("/novo")}
              className="h-12 gap-2 rounded-xl bg-background text-foreground shadow-lg hover:bg-background/90"
            >
              <PlusCircle className="h-5 w-5" />
              Novo serviço
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  disabled
                  className="h-12 gap-2 rounded-xl bg-background/50 text-foreground/50 shadow-lg cursor-not-allowed"
                >
                  <PlusCircle className="h-5 w-5" />
                  Novo serviço
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Limite de 20 ordens atingido.{" "}
                  <span className="font-semibold">Faça upgrade para criar mais.</span>
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente, telefone, item..."
            className="h-12 rounded-xl border-border bg-card pl-10 text-base shadow-sm"
          />
        </div>
        <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-1">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const count = counts[f.key] ?? 0;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-base",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                {f.label}
                <span className={cn("ml-1.5 text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra de uso — aparece apenas para FREE quando >= 50% */}
      <UsageProgress />

      {/* List */}
      {loading ? (
        <Card className="flex flex-col items-center gap-3 border-dashed py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carregando seus serviços...</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-dashed py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">Nenhum serviço por aqui</h3>
            <p className="text-sm text-muted-foreground">
              {services.length === 0 ? "Comece cadastrando seu primeiro serviço." : "Tente outro filtro ou busca."}
            </p>
          </div>
          {services.length === 0 && (
            <Button onClick={() => navigate("/novo")} className="mt-2 gap-2">
              <PlusCircle className="h-4 w-4" />
              Cadastrar serviço
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((s) => (
            <Link
              key={s.id}
              to={`/servico/${s.id}`}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-base hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-lg font-bold text-foreground">{s.customerName}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Smartphone className="h-3.5 w-3.5" />
                    <span className="truncate">{s.device}</span>
                  </div>
                </div>
                <StatusBadge status={s.status} size="sm" />
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-foreground/80">{s.problem ?? s.observations}</p>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {s.customerPhone}
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span>{timeAgo(s.updatedAt)}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 text-primary" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
