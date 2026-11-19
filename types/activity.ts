import type { Enums } from "@/lib/supabase/database.types";

export type ActivityType = Enums<"activity_type">;

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  author: string;
  description: string;
  date: string;
}
