"use client";

import * as React from "react";
import { Menu } from "lucide-react";

import { ShellNav } from "@/components/shell/shell-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-72 flex-col p-0">
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <ShellNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
