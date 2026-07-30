"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockCurrentUser } from "@/lib/mock-data";
import { getInitials } from "@/lib/utils";

export function UserMenu({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{getInitials(mockCurrentUser.name)}</AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{mockCurrentUser.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{mockCurrentUser.email}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="gap-2">
          <User className="size-4" />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2">
          <Link href="/settings" onClick={onNavigate}>
            <Settings className="size-4" />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2"
          onClick={() => {
            onNavigate?.();
            router.push("/login");
          }}
        >
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
