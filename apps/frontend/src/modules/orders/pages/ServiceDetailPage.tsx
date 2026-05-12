import { orderService } from "@/modules/orders/services/order.service";
import { useNavigate, useParams } from "react-router-dom";
import { useService, useProfile } from "@/shared/hooks/use-store";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { StatusTimeline } from "@/modules/orders/components/StatusTimeline";
import {
  STATUS_FLOW,
  STATUS_LABELS,
  ServiceStatus,
} from "@/modules/orders/types";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  MessageCircle,
  Phone,
  Smartphone,
  Trash2,
  Check,
  ChevronRight,
  QrCode,
  Loader2,
} from "lucide-react";
import { QrCodeDialog } from "@/modules/orders/components/QrCodeDialog";
import { useState } from "react";
import {
  buildStatusUpdateMessage,
  buildWhatsAppMessage,
  formatPhoneBR,
  getPublicUrl,
  openWhatsApp,
} from "@/shared/utils/format";
import { toast } from "@/shared/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { cn } from "@/shared/utils/utils";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { service, loading, refresh } = useService(id);
  const profile = useProfile();

  const [showAllStatuses, setShowAllStatuses] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (loading) {
    return (
      <div className="mx-auto max-w-md space-y-3 py-20 text-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-md space-y-3 py-20 text-center">
        <h2 className="font-display text-xl font-bold">
          Serviço não encontrado
        </h2>
        <Button onClick={() => navigate("/")}>Voltar</Button>
      </div>
    );
  }

  const url = getPublicUrl(service.publicToken, profile.slug, service);
  const next = STATUS_FLOW[STATUS_FLOW.indexOf(service.status) + 1];

  async function advance() {
    if (!next || !service || updating) return;

    setUpdating(true);

    try {
      const updated = await orderService.setStatus(
        service.id,
        next
      );

      await refresh();

      toast({
        title: `Status atualizado: ${STATUS_LABELS[next]}`,
        description:
          "Abrindo WhatsApp pra avisar o cliente...",
      });

      setTimeout(() => {
        openWhatsApp(
          updated.customerPhone,
          buildStatusUpdateMessage(updated, profile)
        );
      }, 400);
    } catch (e) {
      toast({
        title: "Erro ao atualizar status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  }

  async function setStatus(status: ServiceStatus) {
    if (!service || updating) return;

    setUpdating(true);

    try {
      await orderService.setStatus(
        service.id,
        status
      );

      await refresh();

      toast({
        title: `Status: ${STATUS_LABELS[status]}`,
      });

      setShowAllStatuses(false);
    } catch (e) {
      toast({
        title: "Erro ao atualizar status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(url);

    toast({
      title: "Link copiado!",
      description: "Cole no WhatsApp do cliente.",
    });
  }

  function sendInitial() {
    openWhatsApp(
      service.customerPhone,
      buildWhatsAppMessage(service, profile)
    );
  }

  function sendUpdate() {
    openWhatsApp(
      service.customerPhone,
      buildStatusUpdateMessage(service, profile)
    );
  }

  function call() {
    window.location.href = `tel:+${service.customerPhone}`;
  }

  async function remove() {
    if (updating) return;

    setUpdating(true);

    try {
      await orderService.remove(service.id);

      toast({
        title: "Serviço removido",
      });

      navigate("/");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-extrabold">
              {service.customerName}
            </h1>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="h-3.5 w-3.5" />
              {service.device}
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={updating}
              className="rounded-xl text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Remover este serviço?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. O link público
                também deixará de funcionar.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={remove}
                className="bg-destructive hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Status */}
      <Card className="space-y-4 rounded-2xl border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Status atual
            </p>

            <div className="mt-1.5">
              <StatusBadge status={service.status} size="lg" />
            </div>
          </div>

          {next ? (
            <Button
              size="lg"
              disabled={updating}
              onClick={advance}
              className="h-12 gap-2 rounded-xl bg-gradient-primary px-5 text-base font-semibold shadow-glow"
            >
              {updating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}

              Avançar pra {STATUS_LABELS[next]}
            </Button>
          ) : (
            <span className="rounded-xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
              ✓ Serviço finalizado
            </span>
          )}
        </div>

        <button
          disabled={updating}
          onClick={() => setShowAllStatuses((v) => !v)}
          className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
        >
          {showAllStatuses ? "Ocultar" : "Mudar pra outro status"}{" "}
          <ChevronRight
            className={cn(
              "inline h-3 w-3 transition-transform",
              showAllStatuses && "rotate-90"
            )}
          />
        </button>

        {showAllStatuses && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {STATUS_FLOW.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                disabled={updating || s === service.status}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-medium transition-base disabled:opacity-50",
                  s === service.status
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted"
                )}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </Card>
      {/* Link público + WhatsApp */}
      <Card className="space-y-4 rounded-2xl border-primary/20 bg-accent/30 p-6 shadow-sm">
        <div>
          <h3 className="font-display text-lg font-bold">Link de acompanhamento</h3>
          <p className="text-sm text-muted-foreground">Mande pro cliente. Ele acompanha sozinho — você não recebe mais "já ficou pronto?".</p>
        </div>

        <div className="flex items-stretch gap-1.5 rounded-xl border border-border bg-background p-1.5">
          <code className="min-w-0 flex-1 truncate px-2 py-2 text-sm text-foreground">{url}</code>
          <Button variant="ghost" size="sm" onClick={copyLink} className="shrink-0 gap-1.5 rounded-lg">
            <Copy className="h-3.5 w-3.5" /> Copiar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setQrOpen(true)} className="shrink-0 gap-1.5 rounded-lg">
            <QrCode className="h-3.5 w-3.5" /> QR
          </Button>
          <Button variant="ghost" size="sm" asChild className="shrink-0 gap-1.5 rounded-lg">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" /> Ver
            </a>
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            size="lg"
            onClick={sendInitial}
            className="h-12 gap-2 rounded-xl bg-[#25D366] text-white shadow-md hover:bg-[#22c55e]"
          >
            <MessageCircle className="h-5 w-5" />
            Enviar link inicial
          </Button>
          <Button
            size="lg"
            onClick={sendUpdate}
            variant="outline"
            className="h-12 gap-2 rounded-xl border-[#25D366]/40 text-[#128C7E] hover:bg-[#25D366]/10"
          >
            <MessageCircle className="h-5 w-5" />
            Avisar atualização
          </Button>
        </div>
      </Card>

      {/* Dados */}
      <Card className="rounded-2xl border-border p-6 shadow-sm">
        <h3 className="mb-3 font-display font-bold">Detalhes</h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">Telefone</dt>
            <dd className="mt-1 flex items-center justify-between gap-2 font-medium">
              {formatPhoneBR(service.customerPhone)}
              <Button variant="ghost" size="sm" onClick={call} className="h-7 gap-1 rounded-md text-xs">
                <Phone className="h-3 w-3" /> Ligar
              </Button>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">Item / Serviço</dt>
            <dd className="mt-1 font-medium">{service.device}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase text-muted-foreground">Descrição</dt>
            <dd className="mt-1">{service.problem}</dd>
          </div>
          {service.observations && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-muted-foreground">Observações</dt>
              <dd className="mt-1 whitespace-pre-wrap text-foreground/80">{service.observations}</dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Histórico */}
      <Card className="rounded-2xl border-border p-6 shadow-sm">
        <h3 className="mb-5 font-display font-bold">Histórico</h3>
        <StatusTimeline current={service.status} history={service.history} variant="vertical" />
      </Card>

      <QrCodeDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        url={url}
        customerName={service.customerName}
        device={service.device}
        shopName={profile.name}
      />
    </div>
  );
}
