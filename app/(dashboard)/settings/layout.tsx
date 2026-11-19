import { SettingsNav } from "@/components/settings/settings-nav";
import { TeamProvider } from "@/components/settings/team-provider";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Workspace, membros e plano da conta.</p>
      </div>

      <SettingsNav />

      <TeamProvider>{children}</TeamProvider>
    </div>
  );
}
