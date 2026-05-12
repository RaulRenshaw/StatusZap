import { orderService } from "@/modules/orders/services/order.service";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Card } from "@/shared/components/ui/card";
import { useProfile } from "@/modules/profile/hooks/useProfile";
import { formatPhoneBR, normalizeBRPhone, openWhatsApp, buildWhatsAppMessage } from "@/shared/utils/format";
import { ArrowLeft, MessageCircle, Send, Smartphone, User } from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";

const ITEM_SUGGESTIONS = ["Roupa", "Celular", "Notebook", "Bicicleta", "Eletrodoméstico", "Outro"];

export default function NewService() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    device: "",
    description: "",    // shown as "Descrição" in UI
    observations: "",   // optional additional notes
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canSubmit =
    form.customerName.trim().length > 1 &&
    normalizeBRPhone(form.customerPhone).length >= 12 &&
    form.device.trim().length > 1 &&
    form.description.trim().length > 2;

  async function save(sendWhats: boolean) {
    if (!canSubmit) {
      toast({
        title: "Preencha os campos",
        description: "Nome, telefone, item e descrição são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      // Merge description + observations into single "observations" field
      // that matches the backend CreateOrderRequestDTO
      const observations = [form.description.trim(), form.observations.trim()]
        .filter(Boolean)
        .join(" — ");

      const order = await orderService.create({
        customerName: form.customerName.trim(),
        customerPhone: normalizeBRPhone(form.customerPhone),
        device: form.device.trim(),
        observations,
      });

      toast({ title: "Serviço cadastrado!", description: "Link gerado e pronto pra enviar." });

      if (sendWhats && order.customerPhone) {
        // buildWhatsAppMessage expects Service shape — map order fields
        const serviceForMsg = { ...order, problem: observations };
        const msg = buildWhatsAppMessage(serviceForMsg as any, profile);
        openWhatsApp(order.customerPhone, msg);
      }

      navigate(`/servico/${order.id}`);
    } catch (e: any) {
      toast({ title: "Erro ao cadastrar", description: e?.message || "Tente novamente.", variant: "destructive" });
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-extrabold">Novo serviço</h1>
          <p className="text-sm text-muted-foreground">Leva menos de 30 segundos.</p>
        </div>
      </div>

      <Card className="space-y-5 rounded-2xl border-border p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-1.5 text-sm font-semibold">
            <User className="h-3.5 w-3.5 text-primary" /> Nome do cliente
          </Label>
          <Input id="name" autoFocus value={form.customerName}
            onChange={(e) => set("customerName", e.target.value)}
            placeholder="Ex: Maria Silva" className="h-12 rounded-xl text-base" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-semibold">
            <MessageCircle className="h-3.5 w-3.5 text-primary" /> WhatsApp do cliente
          </Label>
          <Input id="phone" inputMode="tel" value={form.customerPhone}
            onChange={(e) => set("customerPhone", formatPhoneBR(e.target.value))}
            placeholder="+55 (11) 99999-9999" className="h-12 rounded-xl text-base" />
          <p className="text-xs text-muted-foreground">Usado para enviar o link de acompanhamento.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="device" className="flex items-center gap-1.5 text-sm font-semibold">
            <Smartphone className="h-3.5 w-3.5 text-primary" /> Item / Serviço
          </Label>
          <Input id="device" value={form.device}
            onChange={(e) => set("device", e.target.value)}
            placeholder="Ex: Camisa social, iPhone 13, Bicicleta..."
            className="h-12 rounded-xl text-base" list="items" />
          <datalist id="items">
            {ITEM_SUGGESTIONS.map((d) => <option key={d} value={d} />)}
          </datalist>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold">Descrição do serviço</Label>
          <Textarea id="description" value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Ex: Ajuste na barra, troca de tela, manutenção..."
            rows={3} className="resize-none rounded-xl text-base" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="obs" className="text-sm font-semibold">
            Observações <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea id="obs" value={form.observations}
            onChange={(e) => set("observations", e.target.value)}
            placeholder="Acessórios, valor combinado, prazo..." rows={2}
            className="resize-none rounded-xl text-base" />
        </div>
      </Card>

      <div className="sticky bottom-20 z-20 flex flex-col gap-2 md:bottom-0 md:flex-row">
        <Button size="lg" disabled={!canSubmit || submitting} onClick={() => save(true)}
          className="h-14 w-full gap-2 rounded-xl bg-primary text-base font-semibold shadow-glow">
          <MessageCircle className="h-5 w-5" />
          Cadastrar e enviar WhatsApp
        </Button>
        <Button size="lg" variant="outline" disabled={!canSubmit || submitting} onClick={() => save(false)}
          className="h-14 gap-2 rounded-xl text-base font-semibold md:w-auto md:px-6">
          <Send className="h-4 w-4" /> Só salvar
        </Button>
      </div>
    </div>
  );
}
