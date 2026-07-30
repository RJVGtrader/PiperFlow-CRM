import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { LeadStatus } from "@/types/lead";

const statusConfig: Record<LeadStatus, { label: string; variant: BadgeProps["variant"] }> = {
  novo: { label: "Novo", variant: "outline" },
  contatado: { label: "Contatado", variant: "secondary" },
  qualificado: { label: "Qualificado", variant: "brand" },
  desqualificado: { label: "Desqualificado", variant: "destructive" },
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export const leadStatusOptions: { value: LeadStatus; label: string }[] = (
  Object.keys(statusConfig) as LeadStatus[]
).map((status) => ({ value: status, label: statusConfig[status].label }));
