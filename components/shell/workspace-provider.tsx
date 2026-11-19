"use client";

import * as React from "react";

import { mockWorkspaces } from "@/lib/mock-data";
import type { Workspace } from "@/types/workspace";

interface WorkspaceContextValue {
  workspaces: Workspace[];
  current: Workspace;
  setCurrentId: (id: string) => void;
  /** Renomeia em memória (mock). No M9 vira Server Action. */
  renameWorkspace: (id: string, name: string) => void;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = React.useState(mockWorkspaces);
  const [currentId, setCurrentId] = React.useState(mockWorkspaces[0].id);
  const current = workspaces.find((workspace) => workspace.id === currentId) ?? workspaces[0];

  const renameWorkspace = React.useCallback((id: string, name: string) => {
    setWorkspaces((prev) =>
      prev.map((workspace) => (workspace.id === id ? { ...workspace, name } : workspace))
    );
  }, []);

  const value = React.useMemo(
    () => ({ workspaces, current, setCurrentId, renameWorkspace }),
    [workspaces, current, renameWorkspace]
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
