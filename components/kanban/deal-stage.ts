import type { DealStage } from "@/types/deal";

interface StageConfig {
  label: string;
  /** Barra superior + bolinha de identificação da etapa. */
  accent: string;
  /** Fundo sutil da coluna em repouso. */
  columnBg: string;
  /** Fundo da coluna quando recebe um card arrastado (isOver). */
  dropBg: string;
  /** Borda da coluna quando recebe um card arrastado (isOver). */
  dropBorder: string;
  /** Sombra tingida na cor da etapa, usada no hover do card. */
  cardHoverShadow: string;
}

export const dealStages: DealStage[] = [
  "novo_lead",
  "contato_realizado",
  "proposta_enviada",
  "negociacao",
  "fechado_ganho",
  "fechado_perdido",
];

export const dealStageConfig: Record<DealStage, StageConfig> = {
  novo_lead: {
    label: "Novo Lead",
    accent: "bg-[#3B82F6]",
    columnBg: "bg-[#3B82F6]/[0.06]",
    dropBg: "bg-[#3B82F6]/[0.14]",
    dropBorder: "border-[#3B82F6]/50",
    cardHoverShadow: "hover:shadow-[0_12px_28px_-14px_rgba(59,130,246,0.55)]",
  },
  contato_realizado: {
    label: "Contato Realizado",
    accent: "bg-[#06B6D4]",
    columnBg: "bg-[#06B6D4]/[0.06]",
    dropBg: "bg-[#06B6D4]/[0.14]",
    dropBorder: "border-[#06B6D4]/50",
    cardHoverShadow: "hover:shadow-[0_12px_28px_-14px_rgba(6,182,212,0.55)]",
  },
  proposta_enviada: {
    label: "Proposta Enviada",
    accent: "bg-[#F59E0B]",
    columnBg: "bg-[#F59E0B]/[0.06]",
    dropBg: "bg-[#F59E0B]/[0.14]",
    dropBorder: "border-[#F59E0B]/50",
    cardHoverShadow: "hover:shadow-[0_12px_28px_-14px_rgba(245,158,11,0.55)]",
  },
  negociacao: {
    label: "Negociação",
    accent: "bg-[#F97316]",
    columnBg: "bg-[#F97316]/[0.06]",
    dropBg: "bg-[#F97316]/[0.14]",
    dropBorder: "border-[#F97316]/50",
    cardHoverShadow: "hover:shadow-[0_12px_28px_-14px_rgba(249,115,22,0.55)]",
  },
  fechado_ganho: {
    label: "Fechado Ganho",
    // Etapa positiva: destaque visual maior que as demais (CLAUDE.md).
    accent: "bg-[#22C55E]",
    columnBg: "bg-[#22C55E]/[0.10]",
    dropBg: "bg-[#22C55E]/[0.20]",
    dropBorder: "border-[#22C55E]/60",
    cardHoverShadow: "hover:shadow-[0_12px_28px_-14px_rgba(34,197,94,0.65)]",
  },
  fechado_perdido: {
    label: "Fechado Perdido",
    // Etapa neutra/negativa: mais dessaturada, sem competir com "Fechado Ganho".
    accent: "bg-[#EF4444]/70",
    columnBg: "bg-[#EF4444]/[0.04]",
    dropBg: "bg-[#EF4444]/[0.08]",
    dropBorder: "border-[#EF4444]/30",
    cardHoverShadow: "hover:shadow-[0_10px_24px_-14px_rgba(239,68,68,0.30)]",
  },
};

export const dealStageOptions: { value: DealStage; label: string }[] = dealStages.map((stage) => ({
  value: stage,
  label: dealStageConfig[stage].label,
}));
