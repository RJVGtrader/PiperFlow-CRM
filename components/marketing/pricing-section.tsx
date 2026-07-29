import Link from "next/link";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Para começar a organizar suas vendas sem custo.",
    features: [
      "Até 2 colaboradores",
      "Até 50 leads",
      "Pipeline Kanban completo",
      "Timeline de atividades",
    ],
    cta: "Começar grátis",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    description: "Para times que estão crescendo e precisam escalar.",
    features: [
      "Colaboradores ilimitados",
      "Leads ilimitados",
      "Pipeline Kanban completo",
      "Timeline de atividades",
      "Dashboard de métricas",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    variant: "brand" as const,
    highlight: true,
  },
];

export function PricingSection() {
  return (
    <section id="precos" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Planos simples, sem surpresa
          </h2>
          <p className="mt-4 text-balance text-lg text-muted-foreground">
            Comece grátis. Faça upgrade quando seu time crescer.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlight
                  ? "relative border-brand shadow-lg ring-1 ring-brand"
                  : "relative"
              }
            >
              {plan.highlight ? (
                <Badge variant="brand" className="absolute -top-3 left-6">
                  Mais popular
                </Badge>
              ) : null}

              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button variant={plan.variant} className="w-full" asChild>
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
