import { NavLink, Outlet } from "react-router-dom";
import { Logo } from "@/shared/components/Logo";
import {
  LayoutDashboard, PlusCircle, Settings,
  LogOut, ShieldCheck, Zap
} from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { useIsAdmin } from "@/modules/auth/hooks/use-is-admin";
import { Button } from "@/shared/components/ui/button";
import { toast } from "@/shared/hooks/use-toast";
import { UpgradeBanner } from "@/modules/subscription/components/UpgradeBanner";
import { UpgradeButton } from "@/modules/subscription/components/UpgradeButton";
import { usePlan } from "@/modules/subscription/hooks/usePlan";

const baseLinks = [
  { to: "/",       label: "Serviços", icon: LayoutDashboard, end: true },
  { to: "/novo",   label: "Novo",     icon: PlusCircle },
  { to: "/perfil", label: "Perfil",   icon: Settings },
];

export function AppLayout() {
  const { signOut, user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { isFree } = usePlan();

  const links = isAdmin
    ? [...baseLinks, { to: "/admin", label: "Admin", icon: ShieldCheck }]
    : baseLinks;

  async function handleSignOut() {
    await signOut();
    toast({ title: "Até mais!", description: "Sessão encerrada." });
  }

  return (
    <div className="min-h-screen bg-gradient-soft">

      {/* ── Upgrade banner — only free users, dismissible, once/session ── */}
      <UpgradeBanner />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">

          <NavLink to="/" className="transition-base hover:opacity-80">
            <Logo size="md" />
          </NavLink>

          <div className="flex items-center gap-2">
            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-base",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )
                  }
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* Upgrade button — desktop, free users only */}
            <UpgradeButton variant="header" className="hidden md:flex" />

            {/* Sign out */}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-1.5 rounded-lg text-muted-foreground hover:text-foreground"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="container pb-32 pt-6 md:pt-10">
        <Outlet />
      </main>

      {/* ── Bottom nav — mobile ───────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-around">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-base",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <l.icon className="h-5 w-5" />
              {l.label}
            </NavLink>
          ))}

          {/* Upgrade tab — mobile, free users only */}
          {isFree && (
            <NavLink
              to="/assinar"
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-base",
                  isActive ? "text-primary" : "text-primary/70",
                )
              }
            >
              <div className="relative">
                <Zap className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
              </div>
              Premium
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  );
}
