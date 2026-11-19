import type { WorkspacePlan } from "@/types/workspace";

/**
 * Definição dos planos (PRD, seção Monetização). Fonte única para a landing page,
 * a tela de billing e, no M13, o enforcement dos limites do Free.
 */

export interface PlanDefinition {
  id: WorkspacePlan;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  /** Null = ilimitado. */
  limits: { members: number | null; leads: number | null };
}

export const plans: Record<WorkspacePlan, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Para começar a organizar suas vendas sem custo.",
    features: [
      "Até 2 colaboradores",
      "Até 50 leads",
      "Pipeline Kanban completo",
      "Timeline de atividades",
    ],
    limits: { members: 2, leads: 50 },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    description: "Para times que estão crescendo e precisam escalar.",
    features: [
      "Colaboradores ilimitados",
      "Leads ilimitados",
      "Pipeline Kanban completo",
      "Timeline de atividades",
      "Dashboard de métricas",
      "Suporte prioritário",
    ],
    limits: { members: null, leads: null },
  },
};

export const planOrder: WorkspacePlan[] = ["free", "pro"];
