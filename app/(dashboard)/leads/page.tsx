import type { Metadata } from "next";
import { Users } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";

export const metadata: Metadata = {
  title: "Leads",
};

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">Gerencie seus leads e contatos.</p>
      </div>

      <EmptyState
        icon={Users}
        title="Nenhum lead cadastrado ainda"
        description="A listagem, busca, filtros e o cadastro de leads chegam na M4."
        actionLabel="Novo lead"
      />
    </div>
  );
}
