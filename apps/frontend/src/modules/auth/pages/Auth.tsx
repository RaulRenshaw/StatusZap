import { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card } from "@/shared/components/ui/card";
import { Logo } from "@/shared/components/Logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { toast } from "@/shared/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) return <Navigate to={from} replace />;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      toast({ title: "Erro ao entrar", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Senha muito curta", description: "Use pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email, password, shopName || "Meu Negócio");
      toast({ title: "Conta criada!", description: "Você já pode começar a usar." });
      navigate(from, { replace: true });
    } catch (err: any) {
      toast({ title: "Erro ao cadastrar", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

return (
  <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4 py-8">
    <div className="w-full max-w-md space-y-4"> {/* Reduzido space-y de 6 para 4 */}
      
      {/* Container da Logo ajustado e mais próximo do formulário */}
      <div className="flex justify-center -mt-8 mb-2">
        <Logo size="sm" showName={true} />
      </div>

      <Card className="rounded-2xl border-border p-6 shadow-elevated">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-5">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-l">E-mail</Label>
                  <Input id="email-l" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" placeholder="voce@seunegocio.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-l">Senha</Label>
                  <Input id="pw-l" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" placeholder="••••••" />
                </div>
                <Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl text-base font-semibold shadow-glow">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shop">Nome do negócio</Label>
                  <Input id="shop" required value={shopName} onChange={(e) => setShopName(e.target.value)} className="h-12 rounded-xl" placeholder="Ex: Meu Negócio" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-s">E-mail</Label>
                  <Input id="email-s" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" placeholder="voce@seunegocio.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-s">Senha</Label>
                  <Input id="pw-s" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" placeholder="Mínimo 6 caracteres" />
                </div>
                <Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl text-base font-semibold shadow-glow">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta grátis"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Sem cartão. Comece em 30 segundos.
        </p>
      </div>
    </div>
  );
}
