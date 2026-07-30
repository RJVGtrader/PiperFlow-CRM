import type { Metadata } from "next";

import { LeadsTable } from "@/components/leads/leads-table";
import { mockLeads } from "@/lib/mock-data";

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

      <LeadsTable initialLeads={mockLeads} />
    </div>
  );
}
