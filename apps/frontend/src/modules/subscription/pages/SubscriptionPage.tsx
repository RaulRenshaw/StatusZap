import { useSubscription } from "@/modules/subscription/hooks/useSubscription";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  Zap, CheckCircle2, Loader2, AlertCircle, XCircle,
  Clock, CreditCard, Crown, ArrowRight, RefreshCw
} from "lucide-react";
import { formatDate } from "@/shared/utils/format";

const BENEFITS = [
  "Clientes ilimitados",
  "Link de rastreamento público com logo da loja",
  "Histórico completo de status",
  "WhatsApp automático ao avançar status",
  "QR Code para rastreamento",
  "Atualizações em tempo real (SSE)",
];

export default function SubscriptionPage() {
  const {
    subscription, config, loading, actionLoading, error,
    isPremium, isPending, isCanceled, isPastDue,
    subscribe, cancelSubscription, refresh
  } = useSubscription();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const priceLabel = config
    ? `R$ ${config.amount.toFixed(2).replace(".", ",")}/mês`
    : "R$ 29,00/mês";

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Crown className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold">Assinatura</h1>
          <p className="text-sm text-muted-foreground">Gerencie seu plano.</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => refresh()} className="ml-auto shrink-0 text-xs underline">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Status card */}
      {subscription && (
        <StatusCard
          subscription={subscription}
          isPremium={isPremium}
          isPending={isPending}
          isCanceled={isCanceled}
          isPastDue={isPastDue}
        />
      )}

      {/* Plan card */}
      <Card className="overflow-hidden rounded-2xl border-border shadow-sm">
        {/* Premium badge strip */}
        {isPremium && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 px-5 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-semibold text-primary-foreground">Plano Premium ativo</span>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold">
                  {config ? `R$ ${config.amount.toFixed(2).replace(".", ",")}` : "R$ 29,00"}
                </span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Cancele a qualquer momento.
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
          </div>

          <ul className="mt-6 space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2">
            {!subscription || isCanceled ? (
              <Button
                size="lg"
                disabled={actionLoading}
                onClick={subscribe}
                className="h-14 w-full gap-2 rounded-xl text-base font-semibold shadow-glow"
              >
                {actionLoading
                  ? <><Loader2 className="h-5 w-5 animate-spin" /> Aguarde...</>
                  : <><CreditCard className="h-5 w-5" /> Assinar por {priceLabel} <ArrowRight className="h-4 w-4 ml-1" /></>
                }
              </Button>
            ) : isPending ? (
              <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Pagamento em análise. Aguardando confirmação do Mercado Pago.</span>
                <button onClick={() => refresh(true)} className="ml-auto shrink-0">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            ) : isPastDue ? (
              <>
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Problema no pagamento. Renove sua assinatura.
                </div>
                <Button size="lg" disabled={actionLoading} onClick={subscribe}
                  className="h-14 w-full gap-2 rounded-xl text-base font-semibold">
                  {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Renovar assinatura"}
                </Button>
              </>
            ) : isPremium ? (
              <Button
                variant="outline"
                size="lg"
                disabled={actionLoading}
                onClick={cancelSubscription}
                className="h-12 w-full gap-2 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/5"
              >
                {actionLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Cancelando...</>
                  : <><XCircle className="h-4 w-4" /> Cancelar assinatura</>
                }
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Next billing info */}
      {isPremium && subscription?.nextBillingAt && (
        <p className="text-center text-xs text-muted-foreground">
          Próxima cobrança em{" "}
          <span className="font-medium text-foreground">
            {formatDate(subscription.nextBillingAt)}
          </span>
        </p>
      )}
    </div>
  );
}

// ── Sub-component: status card ────────────────────────────────────────────────

function StatusCard({ subscription, isPremium, isPending, isCanceled, isPastDue }: {
  subscription: NonNullable<ReturnType<typeof useSubscription>["subscription"]>;
  isPremium: boolean;
  isPending: boolean;
  isCanceled: boolean;
  isPastDue: boolean;
}) {
  const statusMap = {
    authorized: { label: "Ativa", color: "text-green-700 bg-green-50 border-green-200" },
    pending:    { label: "Em análise", color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
    canceled:   { label: "Cancelada", color: "text-muted-foreground bg-muted border-border" },
    past_due:   { label: "Pagamento pendente", color: "text-red-700 bg-red-50 border-red-200" },
  };
  const s = statusMap[subscription.status as keyof typeof statusMap] ??
    { label: subscription.status, color: "text-muted-foreground bg-muted border-border" };

  return (
    <Card className="rounded-2xl border-border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
          <span className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.color}`}>
            {s.label}
          </span>
        </div>
        {subscription.lastPaymentAt && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Último pagamento</p>
            <p className="text-sm font-medium">{formatDate(subscription.lastPaymentAt)}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
