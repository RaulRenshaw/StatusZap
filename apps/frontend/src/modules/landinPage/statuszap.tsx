import { useEffect } from "react";
import { Link } from "react-router-dom";
import LogoPadrao from "@/shared/components/ui/images/ChatGPT Image May 17, 2026, 12_28_48 AM (1) (1) (1)-cropped.svg?react";


import {
  ArrowRight,
  Check,
  ClipboardList,
  Link2,
  Zap,
  Eye,
  Smartphone,
  Laptop,
  Wrench,
  Car,
  User,
  Store,
  BarChart3,
  CreditCard,
  Rocket,
  Target,
  Trophy,
  CircleDot,
} from "lucide-react";



export default function LandingPage() {
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    reveals.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  const audience = [
    { icon: Smartphone, label: "Assistência técnica" },
    { icon: Laptop, label: "Informática" },
    { icon: Zap, label: "Eletrônica" },
    { icon: Car, label: "Oficinas" },
    { icon: Wrench, label: "Manutenção geral" },
    { icon: User, label: "Técnico autônomo" },
    { icon: Store, label: "Pequenos negócios" },
  ];

  const features = [
    {
      icon: ClipboardList,
      title: "Ordens de serviço completas",
      desc: "Crie e gerencie OS com cliente, equipamento, status, previsão e histórico.",
    },
    {
      icon: Link2,
      title: "Rastreamento público",
      desc: "Cada OS gera um link único para o cliente acompanhar sem login.",
    },
    {
      icon: Zap,
      title: "Atualizações em tempo real",
      desc: "Mudanças instantâneas usando SSE sem precisar recarregar.",
    },
    {
      icon: BarChart3,
      title: "Dashboard operacional",
      desc: "Visão geral de todas as ordens e serviços em andamento.",
    },
    {
      icon: Smartphone,
      title: "Mobile-first",
      desc: "Interface otimizada para celular para empresa e cliente.",
    },
    {
      icon: CreditCard,
      title: "Planos e assinatura",
      desc: "Integração Mercado Pago e planos recorrentes.",
    },
  ];

  return (
    <div className="relative overflow-x-hidden bg-[#06100a] text-[#dff0e6]">
      {/* NOISE */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* GLOBAL GLOW */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[120px] left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,211,102,0.12)_0%,transparent_70%)] blur-3xl" />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1d3b2a] bg-[#06100add] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
         <div className="flex items-center gap-3 overflow-hidden">
            <LogoPadrao className="h-12 w-30 shrink-0 overflow-hidden" />
          </div>

          <div className="hidden items-center gap-10 md:flex">
            <a
              href="#como-funciona"
              className="text-sm text-[#6d8b7a] transition hover:text-white"
            >
              Como funciona
            </a>

            <a
              href="#funcionalidades"
              className="text-sm text-[#6d8b7a] transition hover:text-white"
            >
              Funcionalidades
            </a>

            <a
              href="#publico"
              className="text-sm text-[#6d8b7a] transition hover:text-white"
            >
              Para quem é
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="hidden rounded-xl border border-[#1f5f39] px-5 py-2.5 text-sm text-[#dff0e6] transition hover:bg-[#0f2016] md:block"
            >
              Entrar
            </Link>

            <Link
              to="/auth"
              className="group relative inline-flex overflow-hidden rounded-xl border border-[#3ef58d33] p-[1px]"
            >
              <span className="absolute inset-[-1000%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#25d366_0%,#8bffb6_25%,#25d366_50%,#0f2016_75%,#25d366_100%)]" />

              <span className="relative inline-flex items-center gap-2 rounded-[11px] bg-[#0d1b12] px-5 py-2.5 font-semibold text-white backdrop-blur-xl transition group-hover:bg-[#112116]">
                Comece grátis
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-36 text-center">
        <div className="mb-8 reveal inline-flex items-center gap-2 rounded-full border border-[#25d36633] bg-[#25d36612] px-5 py-2 text-sm text-[#25d366]">
          <CircleDot className="h-4 w-4 fill-[#25d366]" />
          Gestão de OS + rastreamento para clientes
        </div>

        <h1 className="reveal max-w-[900px] font-['Syne'] text-[clamp(3rem,8vw,6rem)] font-extrabold leading-[0.95] tracking-[-4px] text-white">
          Chega de cliente
          <br />
          perguntando no{" "}
          <span className="bg-gradient-to-r from-[#25d366] to-[#7effaf] bg-clip-text text-transparent">
            WhatsApp.
          </span>
        </h1>

        <p className="reveal mt-8 max-w-[650px] text-[1.05rem] leading-9 text-[#6d8b7a]">
          O StatusZap organiza suas ordens de serviço e dá ao cliente um link
          para acompanhar tudo em tempo real. Menos mensagem, mais
          profissionalismo.
        </p>

        <div className="reveal mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/auth"
            className="group relative inline-flex overflow-hidden rounded-2xl border border-[#3ef58d33] p-[1px]"
          >
            <span className="absolute inset-[-1000%] animate-[spin_7s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#25d366_0%,#8bffb6_20%,#25d366_40%,#0f2016_70%,#25d366_100%)]" />

            <span className="relative inline-flex items-center gap-2 rounded-[15px] bg-[#0d1b12] px-7 py-4 font-bold text-white transition group-hover:bg-[#112116]">
              Criar conta grátis
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            to="/auth"
            className="rounded-2xl border border-[#1f5f39] bg-[#0b1810] px-7 py-4 font-semibold text-[#dff0e6] transition hover:border-[#25d36655] hover:bg-[#102117]"
          >
            Já tenho conta
          </Link>
        </div>

        {/* MOCKUPS */}
        <div className="reveal relative mt-24 grid w-full max-w-6xl gap-5 md:grid-cols-2">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,211,102,0.12)_0%,transparent_70%)] blur-3xl" />

          {/* DASHBOARD */}
          <div className="relative rounded-[24px] border border-[#1d3b2a] bg-[#07150d]/90 p-7 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-2 font-['Syne'] text-xs font-bold uppercase tracking-[3px] text-[#6d8b7a]">
              <ClipboardList className="h-4 w-4 text-[#25d366]" />
              Seu painel
            </div>

            {[
              {
                name: "Celular Samsung",
                client: "Carlos M.",
                status: "Pronto",
                color: "bg-[#25d366]",
                badge: "bg-[#12351f] text-[#4fff95]",
              },
              {
                name: "Notebook Dell",
                client: "Ana L.",
                status: "Em reparo",
                color: "bg-[#f5a623]",
                badge: "bg-[#3d2d08] text-[#ffc44d]",
              },
              {
                name: 'TV 55" LG',
                client: "Marcos T.",
                status: "Aguardando",
                color: "bg-[#4fc3f7]",
                badge: "bg-[#0b3140] text-[#69d0ff]",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-4 border-b border-white/5 py-4 last:border-none"
              >
                <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />

                <div className="flex-1">
                  <div className="text-lg font-semibold text-white">
                    {item.name}
                  </div>

                  <div className="text-sm text-[#6d8b7a]">
                    {item.client}
                  </div>
                </div>

                <span
                  className={`rounded-md px-3 py-1 text-sm font-semibold ${item.badge}`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          {/* TRACKING */}
          <div className="relative rounded-[24px] border border-[#1d3b2a] bg-[#07150d]/90 p-7 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-2 font-['Syne'] text-xs font-bold uppercase tracking-[3px] text-[#6d8b7a]">
              <Smartphone className="h-4 w-4 text-[#25d366]" />
              Cliente vê isso
            </div>

            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25d3661a]">
                <Smartphone className="h-5 w-5 text-[#25d366]" />
              </div>

              <div>
                <div className="text-xl font-bold text-white">
                  Samsung Galaxy S21
                </div>

                <div className="text-sm text-[#6d8b7a]">
                  OS #1042 · Carlos M.
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {[
                "Pronto para retirada",
                "Reparo concluído",
                "Orçamento aprovado",
              ].map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        index === 0
                          ? "bg-[#25d366] shadow-[0_0_14px_#25d366]"
                          : "bg-[#789080]"
                      }`}
                    />

                    {index !== 2 && (
                      <div className="mt-1 min-h-[38px] w-px bg-white/10" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-lg font-medium text-white">
                      {index === 0 && (
                        <Check className="h-4 w-4 text-[#25d366]" />
                      )}

                      {step}
                    </div>

                    <div className="mt-1 text-sm text-[#6d8b7a]">
                      Hoje, 14:32
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="relative border-y border-[#173121] bg-[#07130d] px-6 py-28">
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="relative mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_80px_1fr]">
          {/* LEFT */}
          <div className="reveal">
            <span className="font-['Syne'] text-xs font-bold uppercase tracking-[4px] text-[#25d366]">
              O problema
            </span>

            <h2 className="mt-5 font-['Syne'] text-[clamp(3rem,5vw,5rem)] font-extrabold leading-[0.95] tracking-[-3px] text-white">
              Como era
              <br />
              antes
            </h2>

            <div className="mt-12 space-y-7">
              {[
                'Cliente enviando "já ficou?" toda hora no WhatsApp',
                "Ordens de serviço em papel ou planilha bagunçada",
                "Sem histórico ou rastreabilidade do atendimento",
                "Comunicação desestruturada entre equipe",
                "Imagem pouco profissional perante o cliente",
                "Tempo desperdiçado com atualizações manuais",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-4 text-[1.05rem] text-[#7a9485]"
                >
                  <span className="text-[#44564b]">✕</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* ARROW */}
          <div className="hidden items-center justify-center lg:flex">
            <ArrowRight className="h-10 w-10 text-[#1d5b38]" />
          </div>

          {/* RIGHT */}
          <div className="reveal">
            <span className="font-['Syne'] text-xs font-bold uppercase tracking-[4px] text-[#25d366]">
              A solução
            </span>

            <h2 className="mt-5 font-['Syne'] text-[clamp(3rem,5vw,5rem)] font-extrabold leading-[0.95] tracking-[-3px] text-white">
              Com o
              <br />
              StatusZap
            </h2>

            <div className="mt-12 space-y-7">
              {[
                "Cliente acompanha pelo link — sem precisar perguntar",
                "Ordens de serviço organizadas em painel moderno",
                "Histórico completo salvo automaticamente",
                "Comunicação centralizada e transparente",
                "Experiência profissional que encanta o cliente",
                "Atualizações em tempo real com um clique",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-4 text-[1.05rem] text-[#eaf7ef]"
                >
                  <Check className="mt-1 h-5 w-5 text-[#25d366]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section
        id="como-funciona"
        className="relative overflow-hidden border-b border-[#173121] bg-[#07130d] px-6 py-32"
      >
        <div className="mx-auto max-w-7xl text-center">
          <div className="reveal">
            <span className="font-['Syne'] text-xs font-bold uppercase tracking-[4px] text-[#25d366]">
              Como funciona
            </span>

            <h2 className="mt-6 font-['Syne'] text-[clamp(3rem,5vw,5rem)] font-extrabold tracking-[-3px] text-white">
              Simples do início ao fim.
            </h2>

            <p className="mx-auto mt-7 max-w-3xl text-xl leading-10 text-[#6d8b7a]">
              Do cadastro da OS até o cliente retirar o serviço — tudo
              organizado e transparente.
            </p>
          </div>

          <div className="relative mt-28 grid gap-14 md:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-10 hidden h-px bg-[#173121] lg:block" />

            {[
              {
                icon: ClipboardList,
                title: "Crie a Ordem de Serviço",
                desc: "Registre cliente, equipamento, problema e previsão.",
              },
              {
                icon: Link2,
                title: "Link de rastreamento gerado",
                desc: "Sistema gera um link único automaticamente.",
              },
              {
                icon: Zap,
                title: "Atualize o status",
                desc: "Atualize no painel conforme o serviço avança.",
              },
              {
                icon: Eye,
                title: "Cliente acompanha tudo",
                desc: "Cliente vê o progresso em tempo real.",
              },
            ].map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="reveal relative text-center">
                  <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#1f5f39] bg-[#0d1d13] shadow-[0_0_30px_rgba(37,211,102,0.12)]">
                    <Icon className="h-8 w-8 text-[#25d366]" />
                  </div>

                  <div className="mb-3 font-['Syne'] text-sm font-bold uppercase tracking-[3px] text-[#25d366]">
                    Passo {index + 1}
                  </div>

                  <h3 className="mx-auto max-w-[240px] text-3xl font-bold leading-tight text-white">
                    {step.title}
                  </h3>

                  <p className="mx-auto mt-5 max-w-[260px] text-lg leading-9 text-[#6d8b7a]">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="funcionalidades"
        className="px-6 py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="reveal mb-20 text-center">
            <span className="font-['Syne'] text-xs font-bold uppercase tracking-[4px] text-[#25d366]">
              Funcionalidades
            </span>

            <h2 className="mt-5 font-['Syne'] text-[clamp(3rem,5vw,5rem)] font-extrabold tracking-[-3px] text-white">
              Tudo que sua operação precisa.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-xl leading-10 text-[#6d8b7a]">
              Ferramentas pensadas para pequenos negócios de serviço.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="reveal rounded-[24px] border border-[#173121] bg-[#08150d] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#25d36633]"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25d36614]">
                    <Icon className="h-7 w-7 text-[#25d366]" />
                  </div>

                  <h3 className="font-['Syne'] text-2xl font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-lg leading-9 text-[#6d8b7a]">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section
        id="publico"
        className="border-y border-[#173121] bg-[#07130d] px-6 py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_1.2fr]">
          <div className="reveal">
            <span className="font-['Syne'] text-xs font-bold uppercase tracking-[4px] text-[#25d366]">
              Para quem é
            </span>

            <h2 className="mt-5 font-['Syne'] text-[clamp(3rem,5vw,5rem)] font-extrabold leading-[0.95] tracking-[-3px] text-white">
              Feito para
              <br />
              quem vive
              <br />
              de serviço.
            </h2>

            <p className="mt-8 max-w-2xl text-xl leading-10 text-[#6d8b7a]">
              Se você lida com reparos, manutenções ou atendimentos técnicos e
              quer parar de perder tempo no WhatsApp, o StatusZap é para você.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              {audience.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-full border border-[#1f5f39] bg-[#0d1d13] px-5 py-3 text-white shadow-[0_0_20px_rgba(37,211,102,0.08)]"
                  >
                    <Icon className="h-4 w-4 text-[#25d366]" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="reveal space-y-5">
            {[
              {
                icon: Rocket,
                title: "Comunicação que encanta",
                desc: "Clientes adoram acompanhar o próprio serviço.",
              },
              {
                icon: Target,
                title: "Menos suporte repetitivo",
                desc: 'Sem cliente perguntando "cadê meu aparelho?".',
              },
              {
                icon: Trophy,
                title: "Parece grande, custa pouco",
                desc: "Rastreamento profissional acessível para pequenos negócios.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-[#173121] bg-[#08150d] p-7"
                >
                  <div className="flex gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25d36614]">
                      <Icon className="h-7 w-7 text-[#25d366]" />
                    </div>

                    <div>
                      <h3 className="font-['Syne'] text-2xl font-bold text-white">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-lg leading-9 text-[#6d8b7a]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-[#173121] bg-[#08150d] px-8 py-20 text-center">
          <span className="font-['Syne'] text-xs font-bold uppercase tracking-[4px] text-[#25d366]">
            Comece agora
          </span>

          <h2 className="mt-5 font-['Syne'] text-[clamp(3rem,5vw,5rem)] font-extrabold tracking-[-3px] text-white">
            Organize sua operação.
            <br />
            Impressione seus clientes.
          </h2>

          <p className="mx-auto mt-7 max-w-3xl text-xl leading-10 text-[#6d8b7a]">
            Crie sua conta e comece a usar hoje mesmo.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/auth"
              className="group relative inline-flex overflow-hidden rounded-2xl border border-[#3ef58d33] p-[1px]"
            >
              <span className="absolute inset-[-1000%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#25d366_0%,#8bffb6_25%,#25d366_50%,#0f2016_75%,#25d366_100%)]" />

              <span className="relative inline-flex items-center gap-2 rounded-[15px] bg-[#0d1b12] px-8 py-4 font-bold text-white transition group-hover:bg-[#112116]">
                FAÇA O TESTE!
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm text-[#6d8b7a]">
            <span>✓ Configuração em menos de 5 minutos</span>
            <span>✓ Sem burocracia</span>
            <span>✓ Cancele quando quiser</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#173121] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1f5f39] bg-[#0c1c12]">
              <ClipboardList className="h-5 w-5 text-[#25d366]" />
            </div>

            <span className="font-['Syne'] text-2xl font-extrabold text-white">
              StatusZap
            </span>
          </div>

          <span className="text-sm text-[#6d8b7a]">
            © 2026 StatusZap. Todos os direitos reservados.
          </span>
        </div>
      </footer>

      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .7s ease, transform .7s ease;
        }

        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        html {
          scroll-behavior: smooth;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}