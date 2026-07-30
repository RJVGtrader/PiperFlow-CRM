"use client";

import Link from "next/link";
import { Workflow } from "lucide-react";

import { NavLinks } from "@/components/shell/nav-links";
import { UserMenu } from "@/components/shell/user-menu";
import { WorkspaceSwitcher } from "@/components/shell/workspace-switcher";

export function ShellNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
          onClick={onNavigate}
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <Workflow className="size-4" />
          </span>
          <span>PipeFlow CRM</span>
        </Link>
      </div>

      <div className="border-b border-border p-3">
        <WorkspaceSwitcher />
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <NavLinks onNavigate={onNavigate} />
      </div>

      <div className="border-t border-border p-3">
        <UserMenu onNavigate={onNavigate} />
      </div>
    </>
  );
}
