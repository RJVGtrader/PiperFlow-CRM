import type { Metadata } from "next";

import { PipelineBoard } from "@/components/kanban/pipeline-board";
import { mockDeals, mockLeads } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Pipeline",
};

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">Acompanhe seus negócios por etapa do funil.</p>
      </div>

      <PipelineBoard initialDeals={mockDeals} leads={mockLeads} />
    </div>
  );
}
