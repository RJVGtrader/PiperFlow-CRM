import Link from "next/link";
import { CalendarCheck } from "lucide-react";

import { dealStageConfig } from "@/components/kanban/deal-stage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency, formatDate, getDaysUntil } from "@/lib/utils";
import type { Deal } from "@/types/deal";
import type { Lead } from "@/types/lead";

function getDueLabel(days: number) {
  if (days < 0) {
    const late = Math.abs(days);
    return { text: `Atrasado ${late} ${late === 1 ? "dia" : "dias"}`, tone: "overdue" as const };
  }
  if (days === 0) return { text: "Hoje", tone: "soon" as const };
  if (days === 1) return { text: "Amanhã", tone: "soon" as const };
  return { text: `Em ${days} dias`, tone: days <= 3 ? ("soon" as const) : ("neutral" as const) };
}

// Mesmas cores de prazo usadas nos cards do Kanban.
const dueToneClasses = {
  overdue: "border-[#FF4757]/30 bg-[#FF4757]/10 text-[#FF4757]",
  soon: "border-[#FF6B35]/30 bg-[#FF6B35]/10 text-[#FF6B35]",
  neutral: "border-border text-muted-foreground",
};

interface UpcomingDealsTableProps {
  deals: Deal[];
  leads: Lead[];
}

export function UpcomingDealsTable({ deals, leads }: UpcomingDealsTableProps) {
  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <CalendarCheck className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Nenhum negócio aberto com prazo pendente.</p>
      </div>
    );
  }

  const leadsById = new Map(leads.map((lead) => [lead.id, lead]));

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Negócio</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Prazo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => {
            const lead = leadsById.get(deal.leadId);
            const stage = dealStageConfig[deal.stage];
            const due = getDueLabel(getDaysUntil(deal.dueDate));

            return (
              <TableRow key={deal.id}>
                <TableCell className="max-w-[18rem]">
                  <span className="block truncate font-medium text-foreground">{deal.title}</span>
                  {lead && (
                    <Link
                      href={`/leads/${lead.id}`}
                      className="block truncate text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {lead.name} · {lead.company}
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-2 whitespace-nowrap text-sm">
                    <span className={cn("size-2 shrink-0 rounded-full", stage.accent)} />
                    {stage.label}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-right font-mono font-semibold">
                  {formatCurrency(deal.value)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(deal.dueDate)}
                    </span>
                    <span
                      className={cn(
                        "rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
                        dueToneClasses[due.tone]
                      )}
                    >
                      {due.text}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
