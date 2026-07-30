"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Loader2, Plus, Users, X } from "lucide-react";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const emailSchema = z.string().email("E-mail inválido.");
const MAX_INVITES = 4;

type Step = "workspace" | "invite" | "done";

const steps: { id: Step; label: string }[] = [
  { id: "workspace", label: "Workspace" },
  { id: "invite", label: "Equipe" },
  { id: "done", label: "Concluído" },
];

export function OnboardingFlow() {
  const [step, setStep] = React.useState<Step>("workspace");
  const currentStepIndex = steps.findIndex((item) => item.id === step);

  const [workspaceName, setWorkspaceName] = React.useState("");
  const [workspaceError, setWorkspaceError] = React.useState<string>();

  const [invites, setInvites] = React.useState<string[]>([""]);
  const [inviteErrors, setInviteErrors] = React.useState<(string | undefined)[]>([undefined]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function handleContinueFromWorkspace(event: React.FormEvent) {
    event.preventDefault();
    if (workspaceName.trim().length < 2) {
      setWorkspaceError("Dê um nome ao seu workspace (mínimo 2 caracteres).");
      return;
    }
    setWorkspaceError(undefined);
    setStep("invite");
  }

  function updateInvite(index: number, value: string) {
    setInvites((prev) => prev.map((email, i) => (i === index ? value : email)));
  }

  function addInviteRow() {
    if (invites.length >= MAX_INVITES) return;
    setInvites((prev) => [...prev, ""]);
    setInviteErrors((prev) => [...prev, undefined]);
  }

  function removeInviteRow(index: number) {
    setInvites((prev) => prev.filter((_, i) => i !== index));
    setInviteErrors((prev) => prev.filter((_, i) => i !== index));
  }

  function validateInvites() {
    const errors = invites.map((email) => {
      if (email.trim() === "") return undefined;
      return emailSchema.safeParse(email.trim()).success ? undefined : "E-mail inválido.";
    });
    setInviteErrors(errors);
    return errors.every((error) => !error);
  }

  async function finishOnboarding() {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);
    setStep("done");
  }

  async function handleContinueFromInvites(event: React.FormEvent) {
    event.preventDefault();
    if (!validateInvites()) return;
    await finishOnboarding();
  }

  async function handleSkipInvites() {
    setInvites([""]);
    setInviteErrors([undefined]);
    await finishOnboarding();
  }

  const invitedEmails = invites.map((email) => email.trim()).filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <ol className="flex items-center justify-center gap-2">
        {steps.map((item, index) => {
          const isActive = index <= currentStepIndex;
          return (
            <li key={item.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  isActive ? "bg-brand text-brand-foreground" : "bg-secondary text-secondary-foreground"
                )}
              >
                {index + 1}
              </span>
              {index < steps.length - 1 && (
                <span className={cn("h-px w-8", isActive ? "bg-brand" : "bg-border")} />
              )}
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow">
        {step === "workspace" && (
          <form onSubmit={handleContinueFromWorkspace} noValidate className="space-y-5">
            <div className="space-y-1.5 text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Building2 className="size-5" />
              </div>
              <h1 className="text-xl font-semibold">Crie seu workspace</h1>
              <p className="text-sm text-muted-foreground">
                É aqui que ficam os leads, negócios e atividades da sua equipe.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspace-name">Nome do workspace</Label>
              <Input
                id="workspace-name"
                placeholder="Ex: Acme Vendas"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                aria-invalid={!!workspaceError}
              />
              {workspaceError && (
                <p className="text-[0.8rem] font-medium text-destructive">{workspaceError}</p>
              )}
            </div>

            <Button type="submit" variant="brand" className="w-full">
              Continuar
            </Button>
          </form>
        )}

        {step === "invite" && (
          <form onSubmit={handleContinueFromInvites} noValidate className="space-y-5">
            <div className="space-y-1.5 text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Users className="size-5" />
              </div>
              <h1 className="text-xl font-semibold">Convide sua equipe</h1>
              <p className="text-sm text-muted-foreground">
                Opcional — você pode convidar colaboradores depois em Settings.
              </p>
            </div>

            <div className="space-y-3">
              {invites.map((email, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="colega@empresa.com"
                      value={email}
                      onChange={(event) => updateInvite(index, event.target.value)}
                      aria-invalid={!!inviteErrors[index]}
                    />
                    {invites.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => removeInviteRow(index)}
                        aria-label="Remover e-mail"
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                  {inviteErrors[index] && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {inviteErrors[index]}
                    </p>
                  )}
                </div>
              ))}

              {invites.length < MAX_INVITES && (
                <Button type="button" variant="outline" size="sm" onClick={addInviteRow}>
                  <Plus className="size-4" />
                  Adicionar outro e-mail
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <Button type="submit" variant="brand" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Concluindo...
                  </>
                ) : (
                  "Convidar e concluir"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={handleSkipInvites}
                disabled={isSubmitting}
              >
                Pular por enquanto
              </Button>
            </div>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-semibold">Tudo pronto, {workspaceName}!</h1>
              <p className="text-sm text-muted-foreground">
                {invitedEmails.length > 0
                  ? `Convite simulado para ${invitedEmails.length} ${
                      invitedEmails.length === 1 ? "pessoa" : "pessoas"
                    }. O envio real por e-mail entra no M9.`
                  : "Você pode convidar colegas depois em Settings."}
              </p>
            </div>

            <Alert>
              <AlertTitle>Próximo passo</AlertTitle>
              <AlertDescription>
                O shell do dashboard chega no M3. Por enquanto, esta etapa só valida a UI de
                onboarding.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2">
              <Button type="button" variant="brand" className="w-full" disabled>
                Ir para o dashboard
              </Button>
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Voltar para o início
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
