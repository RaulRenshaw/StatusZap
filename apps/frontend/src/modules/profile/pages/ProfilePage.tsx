import { profileService } from "@/modules/profile/services/profile.service";
import { uploadService } from "@/modules/profile/services/upload.service";
import { useEffect, useState } from "react";
import { useProfile } from "@/modules/profile/hooks/useProfile";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Card } from "@/shared/components/ui/card";
import { ShopProfile } from "@/modules/orders/types";
import { formatPhoneBR, normalizeBRPhone } from "@/shared/utils/format";
import { slugify } from "@/shared/utils/slugify";
import { toast } from "@/shared/hooks/use-toast";
import { Logo } from "@/shared/components/Logo";
import { Save, Upload, Loader2 } from "lucide-react";

const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];

export default function ProfilePage() {
  const { profile } = useProfile();
  const [form, setForm] = useState<ShopProfile>(profile);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(profile), [profile]);

  const set = <K extends keyof ShopProfile>(k: K, v: ShopProfile[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      await profileService.save({
        ...form,
        slug: slugify(form.slug || form.name),
        phone: normalizeBRPhone(form.phone || ""),
      });
      toast({ title: "Perfil salvo!", description: "Suas informações já aparecem no link do cliente." });
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogo(file: File | undefined) {
    if (!file) return;
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      toast({ title: "Tipo não permitido", description: "Use PNG, JPG ou WebP.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "Use uma imagem com até 2MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadService.uploadLogo(file);
      set("logoUrl", url);
      toast({ title: "Logo enviada!", description: "Clique em 'Salvar alterações' para confirmar." });
    } catch (e: any) {
      toast({ title: "Erro no upload", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  const slugPreview = slugify(form.slug || form.name);
  const linkPreview = `${window.location.origin}/r/${slugPreview}/abc123`;

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Perfil do negócio</h1>
        <p className="text-sm text-muted-foreground">
          Aparece pro cliente quando ele abre o link de acompanhamento.
        </p>
      </div>

      <Card className="rounded-2xl border-border p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          <Logo size="lg" showName={false} />
          <div className="flex-1">
            <Label htmlFor="logo" className="text-sm font-semibold">Logo (opcional)</Label>
            <div className="relative mt-1.5">
              <Input id="logo" type="file" accept={ALLOWED_LOGO_TYPES.join(",")}
                onChange={(e) => handleLogo(e.target.files?.[0])}
                disabled={uploading} className="h-11 cursor-pointer rounded-xl" />
              {uploading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG ou WebP. Máx 2MB.</p>
            {form.logoUrl && (
              <button onClick={() => set("logoUrl", undefined)}
                className="mt-1 text-xs text-destructive hover:underline">
                Remover logo
              </button>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">Nome do negócio</Label>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Meu Negócio" className="h-12 rounded-xl text-base" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-semibold">Apelido no link (slug)</Label>
            <div className="flex items-center gap-1.5 rounded-xl border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
              <span className="text-sm text-muted-foreground">/r/</span>
              <Input id="slug" value={form.slug || ""}
                onChange={(e) => set("slug", e.target.value)}
                onBlur={() => set("slug", slugify(form.slug || form.name))}
                placeholder="techfix"
                className="h-12 border-0 bg-transparent px-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0" />
            </div>
            <p className="text-xs text-muted-foreground">
              Preview: <span className="font-mono text-foreground/70">{linkPreview}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold">WhatsApp da loja</Label>
            <Input id="phone" inputMode="tel" value={formatPhoneBR(form?.phone)}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+55 (11) 99999-9999" className="h-12 rounded-xl text-base" />
            <p className="text-xs text-muted-foreground">Cliente vai te chamar por aqui da página pública.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-semibold">Endereço</Label>
            <Input id="address" value={form.address || ""} onChange={(e) => set("address", e.target.value)}
              placeholder="Rua, número, bairro" className="h-12 rounded-xl text-base" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="greeting" className="text-sm font-semibold">Mensagem de boas-vindas</Label>
            <Textarea id="greeting" value={form.greeting || ""}
              onChange={(e) => set("greeting", e.target.value)}
              rows={3} className="resize-none rounded-xl text-base"
              placeholder="Mensagem que aparece no topo do link público pro cliente" />
          </div>
        </div>
      </Card>

      <div className="sticky bottom-20 md:bottom-4">
        <Button onClick={save} disabled={saving || uploading} size="lg"
          className="h-14 w-full gap-2 rounded-xl text-base font-semibold shadow-glow">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
