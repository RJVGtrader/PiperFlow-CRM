"use client";

import * as React from "react";

import { LeadForm, type LeadFormValues } from "@/components/leads/lead-form";
import { useWorkspace } from "@/components/shell/workspace-provider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createLead, updateLead } from "@/lib/leads/actions";
import type { Lead, LeadOwnerOption } from "@/types/lead";

interface LeadFormSheetProps {
  trigger: React.ReactNode;
  lead?: Lead;
  owners: LeadOwnerOption[];
}

export function LeadFormSheet({ trigger, lead, owners }: LeadFormSheetProps) {
  const { user } = useWorkspace();
  const [open, setOpen] = React.useState(false);
  const isEditing = Boolean(lead);

  async function handleSubmit(values: LeadFormValues) {
    const result = lead ? await updateLead(lead.id, values) : await createLead(values);
    if (!result.ok) return result.error;
    // A revalidação da Server Action já traz a lista/detalhe atualizados.
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar lead" : "Novo lead"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Atualize as informações de contato do lead."
              : "Cadastre um novo lead para começar a acompanhar o relacionamento."}{" "}
            Só o nome é obrigatório.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {/* Remonta a cada abertura para refletir os dados mais recentes do lead. */}
          {open && (
            <LeadForm
              defaultValues={lead}
              owners={owners}
              defaultOwnerId={user.id}
              submitLabel={isEditing ? "Salvar alterações" : "Criar lead"}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
