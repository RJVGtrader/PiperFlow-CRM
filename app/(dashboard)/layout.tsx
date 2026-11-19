import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MobileSidebar } from "@/components/shell/mobile-sidebar";
import { Sidebar } from "@/components/shell/sidebar";
import { WorkspaceProvider } from "@/components/shell/workspace-provider";
import { getActiveWorkspace, getCurrentUser, getWorkspaces } from "@/lib/workspaces/queries";

export const metadata: Metadata = {
  title: {
    template: "%s | PipeFlow CRM",
    default: "PipeFlow CRM",
  },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, workspaces, current] = await Promise.all([
    getCurrentUser(),
    getWorkspaces(),
    getActiveWorkspace(),
  ]);

  if (!user) redirect("/login");
  if (!current) redirect("/onboarding");

  return (
    <WorkspaceProvider user={user} workspaces={workspaces} current={current}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 md:hidden">
            <MobileSidebar />
            <span className="text-sm font-semibold">PipeFlow CRM</span>
          </header>

          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
