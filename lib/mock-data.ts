import type { Workspace } from "@/types/workspace";

export const mockWorkspaces: Workspace[] = [
  { id: "ws_acme", name: "Acme Vendas", plan: "pro" },
  { id: "ws_nova", name: "Agência Nova", plan: "free" },
];

export const mockCurrentUser = {
  name: "Ana Souza",
  email: "ana@acmevendas.com",
  role: "admin" as const,
};
