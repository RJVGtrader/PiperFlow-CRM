export type DealStage =
  | "novo_lead"
  | "contato_realizado"
  | "proposta_enviada"
  | "negociacao"
  | "fechado_ganho"
  | "fechado_perdido";

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  leadId: string;
  ownerName: string;
  dueDate: string;
}
