import { redirect } from "next/navigation";

import { SettingsNav } from "@/components/settings/settings-nav";
import { TeamProvider } from "@/components/settings/team-provider";
import { getActiveWorkspace, getWorkspaceTeam } from "@/lib/workspaces/queries";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const workspace = await getActiveWorkspace();
  if (!workspace) redirect("/onboarding");

  const { members, invites } = await getWorkspaceTeam(workspace.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Workspace, membros e plano da conta.</p>
      </div>

      <SettingsNav />

      <TeamProvider members={members} invites={invites}>
        {children}
      </TeamProvider>
    </div>
  );
}
