"use client";

import * as React from "react";

import { LeadForm, type LeadFormValues } from "@/components/leads/lead-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Lead } from "@/types/lead";

interface LeadFormSheetProps {
  trigger: React.ReactNode;
  lead?: Lead;
  onSave: (values: LeadFormValues, lead?: Lead) => void;
}

export function LeadFormSheet({ trigger, lead, onSave }: LeadFormSheetProps) {
  const [open, setOpen] = React.useState(false);
  const isEditing = Boolean(lead);

  async function handleSubmit(values: LeadFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSave(values, lead);
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
              : "Cadastre um novo lead para começar a acompanhar o relacionamento."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <LeadForm
            defaultValues={lead}
            submitLabel={isEditing ? "Salvar alterações" : "Criar lead"}
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
