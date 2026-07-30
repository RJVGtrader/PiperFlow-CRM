"use client";

import * as React from "react";

import { mockWorkspaces } from "@/lib/mock-data";
import type { Workspace } from "@/types/workspace";

interface WorkspaceContextValue {
  workspaces: Workspace[];
  current: Workspace;
  setCurrentId: (id: string) => void;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentId, setCurrentId] = React.useState(mockWorkspaces[0].id);
  const current = mockWorkspaces.find((workspace) => workspace.id === currentId) ?? mockWorkspaces[0];

  const value = React.useMemo(
    () => ({ workspaces: mockWorkspaces, current, setCurrentId }),
    [current]
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
