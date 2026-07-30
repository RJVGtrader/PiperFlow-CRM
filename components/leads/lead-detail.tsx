"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react";

import { ActivityTimeline } from "@/components/leads/activity-timeline";
import { DeleteLeadDialog } from "@/components/leads/delete-lead-dialog";
import { LeadFormSheet } from "@/components/leads/lead-form-sheet";
import type { LeadFormValues } from "@/components/leads/lead-form";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { EmptyState } from "@/components/shell/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, getInitials } from "@/lib/utils";
import type { Activity } from "@/types/activity";
import type { Lead } from "@/types/lead";

export function LeadDetail({ initialLead, activities }: { initialLead: Lead; activities: Activity[] }) {
  const router = useRouter();
  const [lead, setLead] = React.useState(initialLead);

  function handleSave(values: LeadFormValues) {
    setLead((prev) => ({ ...prev, ...values }));
  }

  function handleDelete() {
    router.push("/leads");
  }

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
              <p className="text-sm text-muted-foreground">
                {lead.jobTitle} · {lead.company}
              </p>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {lead.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {lead.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5" />
                  {lead.company}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Responsável: {lead.ownerName} · Criado em {formatDate(lead.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <LeadFormSheet
              lead={lead}
              onSave={handleSave}
              trigger={
                <Button variant="outline">
                  <Pencil className="size-4" />
                  Editar
                </Button>
              }
            />
            <DeleteLeadDialog
              lead={lead}
              onConfirm={handleDelete}
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
