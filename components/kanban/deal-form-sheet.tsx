"use client";

import * as React from "react";

import { DealForm, type DealFormValues } from "@/components/kanban/deal-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Deal, DealStage } from "@/types/deal";
import type { Lead } from "@/types/lead";

interface DealFormSheetProps {
  leads: Lead[];
  trigger?: React.ReactNode;
  deal?: Deal;
  defaultStage?: DealStage;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave: (values: DealFormValues, deal?: Deal) => void;
}

export function DealFormSheet({
  leads,
  trigger,
  deal,
  defaultStage,
  open,
  onOpenChange,
  onSave,
}: DealFormSheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange ?? (() => {}) : setInternalOpen;
  const isEditing = Boolean(deal);

  async function handleSubmit(values: DealFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    onSave(values, deal);
    setIsOpen(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar negócio" : "Novo negócio"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Atualize as informações do negócio."
              : "Cadastre um novo negócio para acompanhar no pipeline."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <DealForm
            leads={leads}
            defaultValues={deal}
            defaultStage={defaultStage}
            submitLabel={isEditing ? "Salvar alterações" : "Criar negócio"}
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
