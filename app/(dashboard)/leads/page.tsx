import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LeadsTable } from "@/components/leads/leads-table";
import { getLeadOwnerOptions, getLeads, parseLeadFilters } from "@/lib/leads/queries";
import { getActiveWorkspace } from "@/lib/workspaces/queries";

export const metadata: Metadata = {
  title: "Leads",
};

interface LeadsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const workspace = await getActiveWorkspace();
  if (!workspace) redirect("/onboarding");

  const filters = parseLeadFilters(searchParams);
  const [leads, owners] = await Promise.all([
    getLeads(workspace.id, filters),
    getLeadOwnerOptions(workspace.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">Gerencie seus leads e contatos.</p>
      </div>

      {/* key: ao trocar de workspace, a busca local recomeça do zero. */}
      <LeadsTable key={workspace.id} leads={leads} filters={filters} owners={owners} />
    </div>
  );
}
