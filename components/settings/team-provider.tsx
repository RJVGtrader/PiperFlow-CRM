"use client";

import * as React from "react";

import { useWorkspace } from "@/components/shell/workspace-provider";
import {
  cancelInvite,
  inviteMember,
  removeMember,
  resendInvite,
  updateMemberRole,
} from "@/lib/workspaces/actions";
import { plans } from "@/lib/plans";
import type { MemberRole, WorkspaceInvite, WorkspaceMember } from "@/types/workspace";

/**
 * Membros e convites do workspace ativo, carregados no layout de Settings e
 * compartilhados entre as abas (a tela de billing mostra o uso de assentos).
 * As ações chamam Server Actions; o revalidatePath delas recarrega estes dados.
 */

interface TeamContextValue {
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
}

const TeamContext = React.createContext<TeamContextValue | null>(null);

export function TeamProvider({
  members,
  invites,
  children,
}: TeamContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ members, invites }), [members, invites]);
  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

/** Equipe do workspace ativo, permissões do usuário logado e ações. */
export function useWorkspaceTeam() {
  const context = React.useContext(TeamContext);
  if (!context) {
    throw new Error("useWorkspaceTeam deve ser usado dentro de um TeamProvider");
  }

  const { current, user } = useWorkspace();
  const { members, invites } = context;
  const currentMember = members.find((member) => member.userId === user.id);

  const seatLimit = plans[current.plan].limits.members;
  // Convites pendentes já reservam assento, para o limite do Free não ser furado.
  const seatsUsed = members.length + invites.length;

  return {
    members,
    invites,
    currentMember,
    // Só UI: a policy RLS é quem garante que membro não altera a equipe.
    canManage: current.role === "admin",
    seatLimit,
    seatsUsed,
    isAtSeatLimit: seatLimit !== null && seatsUsed >= seatLimit,
    inviteMember: (email: string, role: MemberRole) => inviteMember(current.id, email, role),
    resendInvite,
    cancelInvite,
    updateRole: updateMemberRole,
    removeMember,
  };
}
