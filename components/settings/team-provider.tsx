"use client";

import * as React from "react";

import { useWorkspace } from "@/components/shell/workspace-provider";
import { mockCurrentUser, mockInvites, mockMembers } from "@/lib/mock-data";
import { plans } from "@/lib/plans";
import type { MemberRole, WorkspaceInvite, WorkspaceMember } from "@/types/workspace";

/**
 * Membros e convites em memória, compartilhados entre as abas de Settings
 * (a tela de billing mostra o uso de assentos). No M9 vira query + Server Actions.
 */

interface TeamContextValue {
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
  setMembers: React.Dispatch<React.SetStateAction<WorkspaceMember[]>>;
  setInvites: React.Dispatch<React.SetStateAction<WorkspaceInvite[]>>;
}

const TeamContext = React.createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = React.useState(mockMembers);
  const [invites, setInvites] = React.useState(mockInvites);

  const value = React.useMemo(
    () => ({ members, invites, setMembers, setInvites }),
    [members, invites]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

function todayIso() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

/** Equipe do workspace ativo, permissões do usuário logado e ações (mock). */
export function useWorkspaceTeam() {
  const context = React.useContext(TeamContext);
  if (!context) {
    throw new Error("useWorkspaceTeam deve ser usado dentro de um TeamProvider");
  }

  const { current } = useWorkspace();
  const { setMembers, setInvites } = context;

  const members = context.members.filter((member) => member.workspaceId === current.id);
  const invites = context.invites.filter((invite) => invite.workspaceId === current.id);
  const currentMember = members.find((member) => member.email === mockCurrentUser.email);

  const seatLimit = plans[current.plan].limits.members;
  // Convites pendentes já reservam assento, para o limite do Free não ser furado.
  const seatsUsed = members.length + invites.length;

  return {
    members,
    invites,
    currentMember,
    // Só UI: no M8/M9 a policy RLS é quem garante que membro não altera a equipe.
    canManage: currentMember?.role === "admin",
    seatLimit,
    seatsUsed,
    isAtSeatLimit: seatLimit !== null && seatsUsed >= seatLimit,
    inviteMember(email: string, role: MemberRole) {
      setInvites((prev) => [
        ...prev,
        { id: `inv_${Date.now()}`, workspaceId: current.id, email, role, sentAt: todayIso() },
      ]);
    },
    resendInvite(id: string) {
      setInvites((prev) =>
        prev.map((invite) => (invite.id === id ? { ...invite, sentAt: todayIso() } : invite))
      );
    },
    cancelInvite(id: string) {
      setInvites((prev) => prev.filter((invite) => invite.id !== id));
    },
    updateRole(memberId: string, role: MemberRole) {
      setMembers((prev) =>
        prev.map((member) => (member.id === memberId ? { ...member, role } : member))
      );
    },
    removeMember(memberId: string) {
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
    },
  };
}
