"use client";

import * as React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { acceptInvite } from "@/lib/workspaces/actions";

export function AcceptInviteButton({ token }: { token: string }) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();

  function accept() {
    setError(undefined);
    startTransition(async () => {
      // Em caso de sucesso a action redireciona para o dashboard.
      const result = await acceptInvite(token);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-left text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}
      <Button variant="brand" className="w-full" onClick={accept} disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Entrando no workspace...
          </>
        ) : (
          "Aceitar convite"
        )}
      </Button>
    </div>
  );
}

export function SwitchAccountButton({ next }: { next: string }) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={isPending}
      onClick={() => startTransition(() => signOut(next))}
    >
      {isPending && <Loader2 className="size-4 animate-spin" />}
      Sair e entrar com outra conta
    </Button>
  );
}
