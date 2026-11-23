"use client";

import * as React from "react";

import { switchWorkspace } from "@/lib/workspaces/actions";
import type { CurrentUser, Workspace } from "@/types/workspace";

interface WorkspaceContextValue {
  user: CurrentUser;
  workspaces: Workspace[];
  current: Workspace;
  /** Troca o workspace ativo (cookie validado no servidor) e recarrega os dados. */
  setCurrentId: (id: string) => void;
  isSwitching: boolean;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

/** Dados vêm do layout (Server Component); este provider só os distribui. */
export function WorkspaceProvider({
  user,
  workspaces,
  current,
  children,
}: {
  user: CurrentUser;
  workspaces: Workspace[];
  current: Workspace;
  children: React.ReactNode;
}) {
  const [isSwitching, startTransition] = React.useTransition();

  const setCurrentId = React.useCallback(
    (id: string) => {
      if (id === current.id) return;
      startTransition(async () => {
        await switchWorkspace(id);
      });
    },
    [current.id]
  );

  const value = React.useMemo(
    () => ({ user, workspaces, current, setCurrentId, isSwitching }),
    [user, workspaces, current, setCurrentId, isSwitching]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = React.useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace deve ser usado dentro de um WorkspaceProvider");
  }
  return context;
}
