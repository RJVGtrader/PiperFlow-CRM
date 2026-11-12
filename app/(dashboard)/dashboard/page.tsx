import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, KanbanSquare, Percent, Users, Wallet } from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { SalesFunnelChart } from "@/components/dashboard/sales-funnel-chart";
import { UpcomingDealsTable } from "@/components/dashboard/upcoming-deals-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetrics, getFunnelData, getUpcomingDeals } from "@/lib/metrics";
import { mockCurrentUser, mockDeals, mockLeads } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

// Prazos ("hoje", "atrasado") dependem da data da requisição, não da data do build.
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const metrics = getDashboardMetrics(mockLeads, mockDeals);
  const funnel = getFunnelData(mockDeals);
  const upcomingDeals = getUpcomingDeals(mockDeals, mockCurrentUser.name);
  const firstName = mockCurrentUser.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Olá, {firstName}</h1>
        <p className="text-sm text-muted-foreground">
          Veja como estão as vendas da sua equipe hoje.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total de Leads"
          value={String(metrics.totalLeads)}
          icon={Users}
          description={`${metrics.qualifiedLeads} qualificados`}
        />
        <MetricCard
          label="Negócios Abertos"
          value={String(metrics.openDeals)}
          icon={KanbanSquare}
          description={`${metrics.dueThisWeek} com prazo nos próximos 7 dias`}
        />
        <MetricCard
          label="Valor do Pipeline"
          value={formatCurrency(metrics.pipelineValue)}
          icon={Wallet}
          description={`Ticket médio de ${formatCurrency(metrics.averageTicket)}`}
        />
        <MetricCard
          label="Taxa de Conversão"
          value={
            metrics.conversionRate === null ? "—" : `${Math.round(metrics.conversionRate * 100)}%`
          }
          icon={Percent}
          description={`${metrics.wonDeals} ganhos de ${metrics.closedDeals} fechados`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funil de vendas</CardTitle>
          <CardDescription>Quantos negócios chegaram a cada etapa do pipeline.</CardDescription>
        </CardHeader>
        <CardContent>
          <SalesFunnelChart stages={funnel.stages} lostDeals={funnel.lostDeals} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="text-base">Seus próximos prazos</CardTitle>
            <CardDescription>
              Seus negócios abertos, do prazo mais urgente ao mais distante.
            </CardDescription>
          </div>
          <Link
            href="/pipeline"
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            Ver pipeline
            <ArrowRight className="size-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <UpcomingDealsTable deals={upcomingDeals} leads={mockLeads} />
        </CardContent>
      </Card>
    </div>
  );
}
