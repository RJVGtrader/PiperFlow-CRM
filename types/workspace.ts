export type WorkspacePlan = "free" | "pro";

export interface Workspace {
  id: string;
  name: string;
  plan: WorkspacePlan;
}
