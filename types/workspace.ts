import type { Enums } from "@/lib/supabase/database.types";

export type WorkspacePlan = Enums<"subscription_plan">;

export interface Workspace {
  id: string;
  name: string;
  plan: WorkspacePlan;
}

export type MemberRole = Enums<"member_role">;

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  email: string;
  role: MemberRole;
  sentAt: string;
}

export interface Subscription {
  workspaceId: string;
  plan: WorkspacePlan;
  status: "active" | "canceled";
  /** Fim do período atual (próxima cobrança no Pro). Null no Free. */
  currentPeriodEnd: string | null;
}
