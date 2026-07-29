import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Pronto para organizar seu funil de vendas?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-lg text-muted-foreground">
          Crie seu workspace grátis em menos de 2 minutos. Sem cartão de crédito.
        </p>
        <div className="mt-8 flex justify-center">
          <Button variant="brand" size="lg" asChild>
            <Link href="/signup">
              Começar grátis
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
