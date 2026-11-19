"use client";

import * as React from "react";
import { Check, CreditCard, ExternalLink, Info, Loader2, Sparkles } from "lucide-react";

import { useWorkspaceTeam } from "@/components/settings/team-provider";
import { useWorkspace } from "@/components/shell/workspace-provider";
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
import { Progress } from "@/components/ui/progress";
import { mockLeads, mockSubscriptions } from "@/lib/mock-data";
import { planOrder, plans } from "@/lib/plans";
import { cn, formatDate } from "@/lib/utils";

type StripeAction = "checkout" | "portal";

const stripeActionNotice: Record<StripeAction, string> = {
  checkout:
    "Aqui você seria levado ao Stripe Checkout para assinar o Pro. A integração entra no M13.",
  portal:
    "Aqui você seria levado ao Customer Portal do Stripe para trocar cartão, ver faturas ou cancelar. A integração entra no M13.",
};

export function BillingSettings() {
  const { current } = useWorkspace();

  // key: ao trocar de workspace o aviso de ação simulada some.
  return <BillingSettingsContent key={current.id} />;
}

function BillingSettingsContent() {
  const { current } = useWorkspace();
  const { seatsUsed, seatLimit, canManage } = useWorkspaceTeam();
  const [pending, setPending] = React.useState<StripeAction | null>(null);
  const [notice, setNotice] = React.useState<StripeAction | null>(null);

  const subscription = mockSubscriptions.find((item) => item.workspaceId === current.id);
  const plan = plans[current.plan];
  const isPro = current.plan === "pro";

  async function simulateStripe(action: StripeAction) {
    setPending(action);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setPending(null);
    setNotice(action);
  }

  const primaryAction: StripeAction = isPro ? "portal" : "checkout";

  return (
    <div className="space-y-6">
      {notice && (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-4 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">{stripeActionNotice[notice]}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Plano atual</CardDescription>
            <CardTitle className="flex items-center gap-2 font-display text-2xl">
              {plan.name}
              <Badge variant={isPro ? "brand" : "secondary"}>Ativo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="font-mono text-lg font-semibold">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </p>
            <p className="text-muted-foreground">
              {isPro && subscription?.currentPeriodEnd
                ? `Próxima cobrança em ${formatDate(subscription.currentPeriodEnd)}.`
                : "Sem cobrança. Faça upgrade quando o time crescer."}
            </p>
          </CardContent>
          {canManage && (
            <CardFooter>
              <Button
                variant={isPro ? "outline" : "brand"}
                disabled={pending !== null}
                onClick={() => simulateStripe(primaryAction)}
              >
                {pending === primaryAction ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isPro ? (
                  <CreditCard className="size-4" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {isPro ? "Gerenciar assinatura" : "Fazer upgrade para Pro"}
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uso do plano</CardTitle>
            <CardDescription>
              {isPro ? "Sem limites no Pro." : "Limites do plano Free para este workspace."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <UsageMeter label="Colaboradores" used={seatsUsed} limit={seatLimit} />
            <UsageMeter label="Leads" used={mockLeads.length} limit={plan.limits.leads} />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Comparar planos</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {planOrder.map((planId) => {
            const item = plans[planId];
            const isCurrent = planId === current.plan;

            return (
              <Card key={planId} className={cn(isCurrent && "border-brand ring-1 ring-brand")}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    {isCurrent && <Badge variant="brand">Plano atual</Badge>}
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                  <p className="pt-1">
                    <span className="font-mono text-2xl font-semibold">{item.price}</span>
                    <span className="text-sm text-muted-foreground">{item.period}</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                {canManage && !isCurrent && (
                  <CardFooter>
                    {/* Downgrade Pro → Free é feito pelo Customer Portal (cancelamento). */}
                    <Button
                      variant={planId === "pro" ? "brand" : "outline"}
                      className="w-full"
                      disabled={pending !== null}
                      onClick={() => simulateStripe(planId === "pro" ? "checkout" : "portal")}
                    >
                      {planId === "pro" ? (
                        "Assinar Pro"
                      ) : (
                        <>
                          Mudar para Free
                          <ExternalLink className="size-3.5" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
        {!canManage && (
          <p className="mt-3 text-sm text-muted-foreground">
            Apenas admins podem alterar o plano do workspace.
          </p>
        )}
      </div>
    </div>
  );
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const ratio = limit ? Math.min(used / limit, 1) : 0;
  const isFull = limit !== null && used >= limit;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn("font-mono", isFull ? "text-destructive" : "text-muted-foreground")}>
          {limit === null ? `${used} · ilimitado` : `${used} de ${limit}`}
        </span>
      </div>
      {limit !== null && (
        <Progress
          value={ratio * 100}
          aria-label={`${label}: ${used} de ${limit}`}
          className={cn(
            "bg-secondary",
            isFull
              ? "[&>div]:bg-destructive"
              : ratio >= 0.8
                ? "[&>div]:bg-[#FF6B35]"
                : "[&>div]:bg-brand"
          )}
        />
      )}
      {isFull && (
        <p className="text-xs text-destructive">Limite atingido. Faça upgrade para o Pro.</p>
      )}
    </div>
  );
}
