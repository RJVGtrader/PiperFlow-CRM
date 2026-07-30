import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PipelinePreview } from "@/components/marketing/pipeline-preview";

export function HeroSection() {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
        <div className="flex flex-col items-start gap-6 text-left">
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            Feito para PMEs, freelancers e times de vendas
          </span>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Pare de vender por planilha.
            <span className="block text-brand">Organize seu funil de vendas.</span>
          </h1>

          <p className="max-w-xl text-balance text-lg text-muted-foreground">
            O PipeFlow CRM reúne leads, pipeline Kanban e histórico de atividades em um só lugar —
            simples o suficiente para começar hoje, completo o suficiente para o seu time crescer.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="brand" size="lg" asChild>
              <Link href="/signup">
                Começar grátis
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#funcionalidades">Ver funcionalidades</a>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Grátis para até 2 colaboradores. Sem cartão de crédito.
          </p>
        </div>

        <PipelinePreview />
      </div>
    </section>
  );
}
