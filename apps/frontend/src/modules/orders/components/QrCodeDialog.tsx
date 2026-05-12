import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Download, Printer } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  url: string;
  customerName: string;
  device: string;
  shopName: string;
}

export function QrCodeDialog({ open, onOpenChange, url, customerName, device, shopName }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  function download() {
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${customerName.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function print() {
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html>
        <head><title>QR ${customerName}</title>
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; text-align: center; padding: 40px 20px; }
            h1 { font-size: 22px; margin: 0 0 4px; }
            h2 { font-size: 16px; font-weight: 500; margin: 0 0 24px; color: #555; }
            img { width: 280px; height: 280px; }
            p { margin-top: 18px; font-size: 14px; color: #666; max-width: 320px; margin-left: auto; margin-right: auto; }
            .shop { margin-top: 28px; font-size: 13px; color: #888; }
          </style>
        </head>
        <body>
          <h1>${customerName}</h1>
          <h2>${device}</h2>
          <img src="${dataUrl}" alt="QR Code" />
          <p>Escaneie pra acompanhar o status do serviço pelo celular.</p>
          <div class="shop">${shopName}</div>
          <script>window.onload = () => { window.print(); }<\/script>
        </body>
      </html>
    `);
    w.document.close();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code do acompanhamento</DialogTitle>
          <DialogDescription>
            Imprima e cole na ordem de serviço. Cliente escaneia e acompanha pelo celular.
          </DialogDescription>
        </DialogHeader>

        <div ref={wrapRef} className="flex flex-col items-center gap-3 py-2">
          <div className="rounded-2xl border-2 border-border bg-background p-4">
            <QRCodeCanvas value={url} size={220} level="M" includeMargin={false} />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{customerName}</span> · {device}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={download} variant="outline" className="gap-2 rounded-xl">
            <Download className="h-4 w-4" /> Baixar
          </Button>
          <Button onClick={print} className="gap-2 rounded-xl">
            <Printer className="h-4 w-4" /> Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
