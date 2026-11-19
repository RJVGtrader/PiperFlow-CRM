"use client";

import Link from "next/link";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";

import { useWorkspace } from "@/components/shell/workspace-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WorkspaceSwitcher() {
  const { workspaces, current, setCurrentId, isSwitching } = useWorkspace();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between gap-2 px-2.5">
          <span className="flex items-center gap-2 truncate">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand text-xs font-semibold text-brand-foreground">
              {current.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="truncate text-sm font-medium">{current.name}</span>
          </span>
          {isSwitching ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            className="gap-2"
            onClick={() => setCurrentId(workspace.id)}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-secondary-foreground">
              {workspace.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="flex-1 truncate">{workspace.name}</span>
            {workspace.id === current.id && <Check className="size-4 text-brand" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2">
          <Link href="/onboarding">
            <Plus className="size-4" />
            Criar workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
