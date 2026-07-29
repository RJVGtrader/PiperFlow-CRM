import Link from "next/link";
import { Workflow } from "lucide-react";

const linkGroups = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", href: "#funcionalidades" },
      { label: "Planos", href: "#precos" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Entrar", href: "/login" },
      { label: "Criar conta", href: "/signup" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="flex flex-col gap-3">
            <Link href="#" className="flex items-center gap-2 font-semibold">
              <span className="flex size-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
                <Workflow className="size-4" />
              </span>
              <span>PipeFlow CRM</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              CRM simples e direto ao ponto para PMEs, freelancers e times de vendas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            {linkGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <p className="text-sm font-semibold">{group.title}</p>
                <ul className="flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} PipeFlow CRM. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
