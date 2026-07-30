import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";

export const metadata: Metadata = {
  title: "Configurações",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Workspace, membros e plano da conta.</p>
      </div>

      <EmptyState
        icon={Settings}
        title="Configurações chegam na M7"
        description="Dados do workspace, convite de membros e plano/billing."
      />
    </div>
  );
}
