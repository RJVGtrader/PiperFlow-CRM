"use client";

import * as React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteLead } from "@/lib/leads/actions";
import type { Lead } from "@/types/lead";

interface DeleteLeadDialogProps {
  trigger: React.ReactNode;
  lead: Lead;
  /** Volta para /leads após excluir (usado na página de detalhe). */
  redirectToList?: boolean;
}

export function DeleteLeadDialog({ trigger, lead, redirectToList }: DeleteLeadDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function handleOpenChange(next: boolean) {
    if (isPending) return;
    setOpen(next);
    if (next) setError(null);
  }

  function handleConfirm(event: React.MouseEvent) {
    // Mantém o diálogo aberto até a Server Action responder.
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await deleteLead(lead.id, { redirectToList });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {lead.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação remove o lead, seus negócios e o histórico de atividades. Não é possível
            desfazer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
