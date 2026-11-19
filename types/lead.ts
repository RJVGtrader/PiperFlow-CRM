import type { Enums } from "@/lib/supabase/database.types";

export type LeadStatus = Enums<"lead_status">;

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  status: LeadStatus;
  ownerName: string;
  createdAt: string;
}
