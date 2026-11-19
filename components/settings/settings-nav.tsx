"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/settings", label: "Workspace" },
  { href: "/settings/members", label: "Membros" },
  { href: "/settings/billing", label: "Plano e cobrança" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="-mb-px flex gap-6 overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              isActive
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
