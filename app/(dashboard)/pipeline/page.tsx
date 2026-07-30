import type { Metadata } from "next";
import { KanbanSquare } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";

export const metadata: Metadata = {
  title: "Pipeline",
};

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">Acompanhe seus negócios por etapa do funil.</p>
      </div>

      <EmptyState
        icon={KanbanSquare}
        title="Seu pipeline está vazio"
        description="O board Kanban com colunas por etapa e drag-and-drop chega na M5."
        actionLabel="Novo negócio"
      />
    </div>
  );
}
