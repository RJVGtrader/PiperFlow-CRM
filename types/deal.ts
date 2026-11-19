import type { Enums } from "@/lib/supabase/database.types";

export type DealStage = Enums<"deal_stage">;

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  leadId: string;
  ownerName: string;
  dueDate: string;
}
