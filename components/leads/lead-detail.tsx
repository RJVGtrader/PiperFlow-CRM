import { Building2, Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react";

import { ActivityTimeline } from "@/components/leads/activity-timeline";
import { DeleteLeadDialog } from "@/components/leads/delete-lead-dialog";
import { LeadFormSheet } from "@/components/leads/lead-form-sheet";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { EmptyState } from "@/components/shell/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, getInitials } from "@/lib/utils";
import type { Activity } from "@/types/activity";
import type { Lead, LeadOwnerOption } from "@/types/lead";

interface LeadDetailProps {
  lead: Lead;
  owners: LeadOwnerOption[];
  activities: Activity[];
}

export function LeadDetail({ lead, owners, activities }: LeadDetailProps) {
  const subtitle = [lead.jobTitle, lead.company].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="text-base">{getInitials(lead.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">{lead.name}</h1>
                <LeadStatusBadge status={lead.status} />
              </div>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-1.5 hover:text-foreground hover:underline"
                  >
                    <Mail className="size-3.5" />
                    {lead.email}
                  </a>
                )}
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-1.5 hover:text-foreground hover:underline"
                  >
                    <Phone className="size-3.5" />
                    {lead.phone}
                  </a>
                )}
                {lead.company && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    {lead.company}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Responsável: {lead.ownerName || "Sem responsável"} · Criado em{" "}
                {formatDate(lead.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <LeadFormSheet
              lead={lead}
              owners={owners}
              trigger={
                <Button variant="outline">
                  <Pencil className="size-4" />
                  Editar
                </Button>
              }
            />
            <DeleteLeadDialog
              lead={lead}
              redirectToList
              trigger={
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 className="size-4" />
                  Excluir
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Atividades</h2>
          <Button variant="outline" size="sm" disabled title="Em breve">
            <Plus className="size-4" />
            Registrar atividade
          </Button>
        </div>

        {activities.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Nenhuma atividade registrada"
            description="Ligações, e-mails, reuniões e notas aparecem aqui. O registro real chega na M11."
          />
        ) : (
          <Card>
            <CardContent className="p-6">
              <ActivityTimeline activities={activities} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
