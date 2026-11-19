import type { Metadata } from "next";

import { WorkspaceSettings } from "@/components/settings/workspace-settings";

export const metadata: Metadata = {
  title: "Configurações",
};

export default function SettingsPage() {
  return <WorkspaceSettings />;
}
