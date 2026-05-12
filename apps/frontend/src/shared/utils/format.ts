import { Service, ShopProfile, STATUS_LABELS } from "@/modules/orders/types";
export function onlyDigits(v?: string | null) {
  return (v ?? "").replace(/\D/g, "");
}

export function formatPhoneBR(value?: string | null) {
  const d = onlyDigits(value).slice(0, 13);

  // 55 11 99999-9999
  if (d.length <= 2) return d;

  if (d.length <= 4) {
    return `+${d.slice(0, 2)} (${d.slice(2)}`;
  }

  if (d.length <= 6) {
    return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4)}`;
  }

  if (d.length <= 11) {
    return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  }

  return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9, 13)}`;
}

export function normalizeBRPhone(value?: string | null) {
  let d = onlyDigits(value);

  if (d.length === 10 || d.length === 11) {
    d = "55" + d;
  }

  return d;
}


function linkSlug(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 48);
}

function getPublicOrigin() {
  return window.location.origin;
}

export function getPublicUrl(token: string, slug?: string, _service?: Pick<Service, "customerName" | "device">) {
  const short = token.slice(0, 10);
  const origin = getPublicOrigin();
  if (slug) return `${origin}/${slug}/${short}`;
  // Fallback antigo, caso a loja ainda não tenha slug
  return `${origin}/r/${token}`;
}

export function buildWhatsAppMessage(service: Service, profile: ShopProfile) {
  const url = getPublicUrl(service.publicToken, profile.slug, service);
  const shop = profile.name || "nosso negócio";
  const status = STATUS_LABELS[service.status];

  return (
`Olá, ${service.customerName.split(" ")[0]}!

Aqui é da *${shop}*. Seu *${service.device}* já está com a gente.

Status atual: *${status}*

Pra acompanhar seu serviço a qualquer hora, é só abrir esse link:
${url}

Qualquer coisa, é só responder essa mensagem!`
  );
}

export function buildStatusUpdateMessage(service: Service, profile: ShopProfile) {
  const url = getPublicUrl(service.publicToken, profile.slug, service);
  const shop = profile.name || "nosso negócio";
  const status = STATUS_LABELS[service.status];

  if (service.status === "pronto") {
    return (
`Boa notícia, ${service.customerName.split(" ")[0]}!

Seu *${service.device}* está *pronto pra retirar*.

${profile.address ? `Endereço: ${profile.address}\n\n` : ""}Detalhes do serviço: ${url}

— ${shop}`
    );
  }

  return (
`Oi, ${service.customerName.split(" ")[0]}!

Atualização do seu *${service.device}*:
*${status}*

Acompanhe aqui: ${url}

— ${shop}`
  );
}

export function openWhatsApp(phone: string, message: string) {
  const normalized = normalizeBRPhone(phone);
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `há ${days}d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
