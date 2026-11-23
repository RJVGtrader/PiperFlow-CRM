import { cache } from "react";
import { cookies } from "next/headers";

import { ACTIVE_WORKSPACE_COOKIE } from "@/lib/supabase/cookies";
import { createClient } from "@/lib/supabase/server";
import type {
  CurrentUser,
  Subscription,
  Workspace,
  WorkspaceInvite,
  WorkspaceMember,
} from "@/types/workspace";

/**
 * Leituras de servidor do usuário logado e dos seus workspaces. Todas passam pela
 * RLS; o cache() do React deduplica as chamadas dentro de uma mesma request.
 */

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    name: profile?.full_name || user.email?.split("@")[0] || "",
    email: profile?.email ?? user.email ?? "",
  };
});

export const getWorkspaces = cache(async (): Promise<Workspace[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspace:workspaces!inner(id, name, subscription:subscriptions(plan))")
    .eq("user_id", user.id)
    .order("created_at");

  if (error) throw error;

  return data.map(({ role, workspace }) => ({
    id: workspace.id,
    name: workspace.name,
    plan: workspace.subscription?.plan ?? "free",
    role,
  }));
});

/**
 * Workspace ativo: o do cookie, se o usuário ainda for membro; senão o primeiro.
 * Null quando o usuário não tem nenhum workspace (vai para o onboarding).
 */
export const getActiveWorkspace = cache(async (): Promise<Workspace | null> => {
  const workspaces = await getWorkspaces();
  const preferredId = cookies().get(ACTIVE_WORKSPACE_COOKIE)?.value;
  return workspaces.find((workspace) => workspace.id === preferredId) ?? workspaces[0] ?? null;
});

export async function getWorkspaceTeam(workspaceId: string) {
  const supabase = createClient();

  const [membersResult, invitesResult] = await Promise.all([
    supabase
      .from("workspace_members")
      .select(
        "id, workspace_id, user_id, role, created_at, profile:profiles!inner(full_name, email)"
      )
      .eq("workspace_id", workspaceId)
      .order("created_at"),
    // RLS: só admins enxergam convites; para membros a lista vem vazia.
    supabase
      .from("workspace_invites")
      .select("id, workspace_id, email, role, last_sent_at")
      .eq("workspace_id", workspaceId)
      .order("created_at"),
  ]);

  if (membersResult.error) throw membersResult.error;
  if (invitesResult.error) throw invitesResult.error;

  const members: WorkspaceMember[] = membersResult.data.map((member) => ({
    id: member.id,
    workspaceId: member.workspace_id,
    userId: member.user_id,
    name: member.profile.full_name,
    email: member.profile.email,
    role: member.role,
    joinedAt: member.created_at.slice(0, 10),
  }));

  const invites: WorkspaceInvite[] = invitesResult.data.map((invite) => ({
    id: invite.id,
    workspaceId: invite.workspace_id,
    email: invite.email,
    role: invite.role,
    sentAt: invite.last_sent_at.slice(0, 10),
  }));

  return { members, invites };
}

export async function getSubscription(workspaceId: string): Promise<Subscription | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("workspace_id, plan, status, current_period_end")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    workspaceId: data.workspace_id,
    plan: data.plan,
    status: data.status,
    currentPeriodEnd: data.current_period_end?.slice(0, 10) ?? null,
  };
}
