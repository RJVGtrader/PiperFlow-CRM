export type ActivityType = "ligacao" | "email" | "reuniao" | "nota";

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  author: string;
  description: string;
  date: string;
}
