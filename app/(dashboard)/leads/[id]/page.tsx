import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { LeadDetail } from "@/components/leads/lead-detail";
import { getLead, getLeadOwnerOptions } from "@/lib/leads/queries";
import { getActiveWorkspace } from "@/lib/workspaces/queries";

interface LeadDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: LeadDetailPageProps): Promise<Metadata> {
  const workspace = await getActiveWorkspace();
  const lead = workspace ? await getLead(workspace.id, params.id) : null;
  return { title: lead ? lead.name : "Lead" };
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const workspace = await getActiveWorkspace();
  if (!workspace) redirect("/onboarding");

  const [lead, owners] = await Promise.all([
    getLead(workspace.id, params.id),
    getLeadOwnerOptions(workspace.id),
  ]);

  if (!lead) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para Leads
      </Link>

      {/* Timeline de atividades com dados reais chega na M11. */}
      <LeadDetail lead={lead} owners={owners} activities={[]} />
    </div>
  );
}
