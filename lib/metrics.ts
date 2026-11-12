import { getDaysUntil } from "@/lib/utils";
import type { Deal, DealStage } from "@/types/deal";
import type { Lead } from "@/types/lead";

/**
 * Cálculo das métricas do dashboard a partir de leads/negócios já carregados.
 * Funções puras: no M12 a fonte troca de mock para query no Supabase, sem mexer na UI.
 */

const closedStages: DealStage[] = ["fechado_ganho", "fechado_perdido"];

/** Etapas do funil, em ordem. "Fechado Perdido" fica de fora: não é um avanço no funil. */
const funnelStages: DealStage[] = [
  "novo_lead",
  "contato_realizado",
  "proposta_enviada",
  "negociacao",
  "fechado_ganho",
];

export function isOpenDeal(deal: Deal) {
  return !closedStages.includes(deal.stage);
}

export interface DashboardMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  openDeals: number;
  dueThisWeek: number;
  pipelineValue: number;
  averageTicket: number;
  wonDeals: number;
  closedDeals: number;
  /** Ganhos ÷ fechados (0–1), ou null quando ainda não há negócios fechados. */
  conversionRate: number | null;
}

export function getDashboardMetrics(leads: Lead[], deals: Deal[]): DashboardMetrics {
  const open = deals.filter(isOpenDeal);
  const won = deals.filter((deal) => deal.stage === "fechado_ganho").length;
  const closed = deals.length - open.length;
  const pipelineValue = open.reduce((sum, deal) => sum + deal.value, 0);

  return {
    totalLeads: leads.length,
    qualifiedLeads: leads.filter((lead) => lead.status === "qualificado").length,
    openDeals: open.length,
    dueThisWeek: open.filter((deal) => {
      const days = getDaysUntil(deal.dueDate);
      return days >= 0 && days <= 7;
    }).length,
    pipelineValue,
    averageTicket: open.length > 0 ? pipelineValue / open.length : 0,
    wonDeals: won,
    closedDeals: closed,
    conversionRate: closed > 0 ? won / closed : null,
  };
}

export interface FunnelStageData {
  stage: DealStage;
  /** Negócios que chegaram pelo menos até esta etapa (base do funil). */
  reached: number;
  /** Negócios parados nesta etapa agora. */
  current: number;
  /** Valor dos negócios parados nesta etapa agora. */
  value: number;
}

export function getFunnelData(deals: Deal[]) {
  const stages: FunnelStageData[] = funnelStages.map((stage, index) => {
    const inStage = deals.filter((deal) => deal.stage === stage);
    return {
      stage,
      reached: deals.filter((deal) => funnelStages.indexOf(deal.stage) >= index).length,
      current: inStage.length,
      value: inStage.reduce((sum, deal) => sum + deal.value, 0),
    };
  });

  return {
    stages,
    lostDeals: deals.filter((deal) => deal.stage === "fechado_perdido").length,
  };
}

/** Negócios abertos de um responsável, do prazo mais próximo (ou mais atrasado) ao mais distante. */
export function getUpcomingDeals(deals: Deal[], ownerName: string, limit = 6) {
  return deals
    .filter((deal) => isOpenDeal(deal) && deal.ownerName === ownerName)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, limit);
}
