import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Service, ShopProfile, STATUS_DESCRIPTIONS } from "@/modules/orders/types";
import { trackingService } from "@/modules/tracking/services/tracking.service";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { StatusTimeline } from "@/modules/orders/components/StatusTimeline";
import { Logo } from "@/shared/components/Logo";
import { Button } from "@/shared/components/ui/button";
import { MessageCircle, MapPin, RefreshCw, Smartphone, ShieldCheck } from "lucide-react";
import { formatDate, normalizeBRPhone } from "@/shared/utils/format";
import { useTrackingEvents } from "@/modules/tracking/hooks/useTrackingEvents";

const FALLBACK_PROFILE: ShopProfile = {
  name: "Negócio",
  slug: "loja",
  phone: "",
  greeting: "Acompanhe aqui o status do seu pedido.",
};

export default function PublicTracking() {
  const { token, slug, short } = useParams();

  const [profile, setProfile] = useState<ShopProfile>(FALLBACK_PROFILE);
  const [service, setService] = useState<Service | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      let result;
      if (short && slug) {
        result = await trackingService.getByShortToken(slug, short);
      } else {
        result = await trackingService.getByToken(token ?? "");
      }

      // Backend returns { order, profile }
      setService(result.order);
      if (result.profile) setProfile(result.profile);
      else if (slug) {
        const p = await trackingService.getProfileBySlug(slug).catch(() => null);
        if (p) setProfile(p);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
      if (!silent) setTimeout(() => setRefreshing(false), 500);
    }
  }, [token, slug, short]);

  useEffect(() => { load(true); }, [load]);

  // SSE real-time updates — only when tracking by token
  useTrackingEvents({
    token: token ?? "",
    onStatusChanged: () => load(true),
  });

  // Polling fallback — 3 min
  useEffect(() => {
    const id = setInterval(() => load(true), 180_000);
    return () => clearInterval(id);
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Smartphone className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-extrabold">Link inválido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esse link de acompanhamento não existe ou foi removido. Confirme com o negócio.
          </p>
        </div>
      </div>
    );
  }

  const shopWhats = profile.phone ? normalizeBRPhone(profile.phone) : "";
  const whatsUrl = shopWhats
    ? `https://wa.me/${shopWhats}?text=${encodeURIComponent(`Olá! Sou ${service.customerName}, sobre meu ${service.device}.`)}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-soft pb-16">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <Logo size="md" profile={profile} />
          {whatsUrl && (
            <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-xl border-[#25D366]/40 text-[#128C7E]">
              <a href={whatsUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </Button>
          )}
        </div>
      </header>

      <main className="container max-w-2xl space-y-6 pt-6">
        <section className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-elevated animate-slide-up">
          <p className="text-sm text-primary-foreground/85">Olá, {service.customerName.split(" ")[0]}</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight md:text-3xl">
            {STATUS_DESCRIPTIONS[service.status]}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
              <Smartphone className="h-4 w-4" />
              <span className="font-medium">{service.device}</span>
            </div>
            <StatusBadge status={service.status} size="md" className="!border-white/30 !bg-white/15 !text-white" />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display font-bold">Progresso do serviço</h2>
            <button
              onClick={() => load(false)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar
            </button>
          </div>
          <StatusTimeline current={service.status} history={service.history} variant="horizontal" />
          <p className="mt-5 text-xs text-muted-foreground">Última atualização em {formatDate(service.updatedAt)}</p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-5 font-display font-bold">Linha do tempo</h2>
          <StatusTimeline current={service.status} history={service.history} variant="vertical" />
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold">{profile.name}</h3>
              {profile.greeting && <p className="mt-1 text-sm text-muted-foreground">{profile.greeting}</p>}
              {profile.address && (
                <div className="mt-3 flex items-center gap-1.5 text-sm text-foreground/80">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {profile.address}
                </div>
              )}
            </div>
          </div>
          {whatsUrl && (
            <Button asChild className="mt-4 h-12 w-full gap-2 rounded-xl bg-[#25D366] text-white shadow-md hover:bg-[#22c55e]">
              <a href={whatsUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
              </a>
            </Button>
          )}
        </section>

        <p className="text-center text-xs text-muted-foreground">
          Acompanhamento gerado por <span className="font-semibold text-foreground/70">Serviço Rápido</span>
        </p>
      </main>
    </div>
  );
}
