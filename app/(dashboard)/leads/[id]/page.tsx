import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { LeadDetail } from "@/components/leads/lead-detail";
import { mockActivities, mockLeads } from "@/lib/mock-data";

interface LeadDetailPageProps {
  params: { id: string };
}

export function generateMetadata({ params }: LeadDetailPageProps): Metadata {
  const lead = mockLeads.find((item) => item.id === params.id);
  return { title: lead ? lead.name : "Lead" };
}

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
  const lead = mockLeads.find((item) => item.id === params.id);

  if (!lead) {
    notFound();
  }

  const activities = mockActivities.filter((activity) => activity.leadId === lead.id);

  return (
    <div className="space-y-6">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para Leads
      </Link>

      <LeadDetail initialLead={lead} activities={activities} />
    </div>
  );
}
