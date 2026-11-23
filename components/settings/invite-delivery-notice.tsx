"use client";

import * as React from "react";
import { Check, CheckCircle2, Copy, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InviteDelivery } from "@/lib/workspaces/actions";

/**
 * Resultado de um convite: confirmação do e-mail enviado ou, se o Resend não
 * estiver configurado/falhar, o link para o admin copiar e mandar à pessoa.
 */
export function InviteDeliveryNotice({ delivery }: { delivery: InviteDelivery }) {
  const [copied, setCopied] = React.useState(false);

  if (delivery.emailSent) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-brand">
        <CheckCircle2 className="size-4 shrink-0" />
        Convite enviado por e-mail para {delivery.email}.
      </p>
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(delivery.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem permissão de clipboard: o campo continua selecionável.
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-secondary/50 p-3">
      <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
        <Link2 className="mt-0.5 size-4 shrink-0" />
        <span>
          Convite criado para <span className="font-medium text-foreground">{delivery.email}</span>,
          mas o e-mail não foi enviado. Copie o link e envie para a pessoa:
        </span>
      </p>
      <div className="flex gap-2">
        <Input
          readOnly
          value={delivery.inviteUrl}
          className="h-8 font-mono text-xs"
          onFocus={(event) => event.currentTarget.select()}
          aria-label={`Link de convite para ${delivery.email}`}
        />
        <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={copyLink}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </div>
  );
}
