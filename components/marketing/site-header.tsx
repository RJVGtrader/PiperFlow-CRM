import Link from "next/link";
import { Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#precos", label: "Planos" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="#" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <Workflow className="size-4" />
          </span>
          <span>PipeFlow CRM</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button variant="brand" size="sm" asChild>
            <Link href="/signup">Começar grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
