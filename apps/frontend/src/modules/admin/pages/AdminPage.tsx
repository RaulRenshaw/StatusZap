import { Navigate } from "react-router-dom";
import { useIsAdmin } from "@/modules/auth/hooks/use-is-admin";
import { useAdmin } from "@/modules/admin/hooks/useAdmin";
import { Card } from "@/shared/components/ui/card";
import { ShieldCheck, Loader2, Users, BarChart3, Activity } from "lucide-react";

export default function AdminPage() {
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const { metrics, accounts, loading, error } = useAdmin();

  if (roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel administrativo</h1>
          <p className="text-sm text-muted-foreground">Visão geral de contas e atividade.</p>
        </div>
      </div>

      {error && (
        <Card className="rounded-2xl border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {metrics && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total de contas", value: metrics.totalAccounts, icon: Users },
                { label: "Contas ativas", value: metrics.activeAccounts, icon: Activity },
                { label: "Ordens (30 dias)", value: metrics.ordersLast30Days, icon: BarChart3 },
                { label: "Total de ordens", value: metrics.totalOrders, icon: BarChart3 },
              ].map((stat) => (
                <Card key={stat.label} className="rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                </Card>
              ))}
            </div>
          )}

          <Card className="rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold">Contas</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    {["E-mail", "Nome do negócio", "Papel", "Ordens"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {accounts.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{a.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.shopName ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          a.role === "ADMIN"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {a.role.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
