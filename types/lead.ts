import type { Enums } from "@/lib/supabase/database.types";

export type LeadStatus = Enums<"lead_status">;

export interface Lead {
  id: string;
  name: string;
  /** Campos de contato opcionais no banco; vazios chegam como "". */
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  status: LeadStatus;
  /** Membro responsável (null = sem responsável). */
  ownerId: string | null;
  ownerName: string;
  createdAt: string;
}

export type LeadPeriod = "all" | "7d" | "30d" | "month";

export interface LeadFilters {
  q: string;
  status: LeadStatus | "all";
  /** Id do responsável, "none" (sem responsável) ou "all". */
  owner: string;
  period: LeadPeriod;
}

/** Opção do select de responsável: membro do workspace ativo. */
export interface LeadOwnerOption {
  id: string;
  name: string;
}
