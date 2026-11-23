import type { Metadata } from "next";
import Link from "next/link";
import { MailX, Users } from "lucide-react";
import { z } from "zod";

import { AcceptInviteButton, SwitchAccountButton } from "@/components/auth/invite-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authHref } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/workspaces/queries";

export const metadata: Metadata = {
  title: "Convite | PipeFlow CRM",
};

const roleLabels = { admin: "admin", membro: "membro" } as const;

async function getInvite(token: string) {
  if (!z.string().uuid().safeParse(token).success) return null;
  const supabase = createClient();
  const { data } = await supabase.rpc("get_invite", { invite_token: token }).maybeSingle();
  return data;
}

function InvalidInvite({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Card>
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <MailX className="size-5" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Ir para o PipeFlow</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default async function InvitePage({ params }: { params: { token: string } }) {
  const [invite, user] = await Promise.all([getInvite(params.token), getCurrentUser()]);

  if (!invite) {
    return (
      <InvalidInvite
        title="Convite inválido"
        description="Este convite não existe, foi cancelado ou já foi utilizado. Peça um novo ao admin do workspace."
      />
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <InvalidInvite
        title="Convite expirado"
        description="Convites valem por 7 dias. Peça ao admin do workspace para reenviar o convite."
      />
    );
  }

  const invitePath = `/invite/${params.token}`;
  const isInvitedUser = user?.email.toLowerCase() === invite.email;

  return (
    <div className="mx-auto w-full max-w-sm">
      <Card>
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Users className="size-5" />
          </div>
          <CardTitle className="text-xl">Entrar em {invite.workspace_name}</CardTitle>
          <CardDescription>
            {invite.invited_by_name || "Um admin"} convidou{" "}
            <span className="font-medium text-foreground">{invite.email}</span> para o workspace
            como {roleLabels[invite.role]}.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {!user && (
            <>
              <Button asChild variant="brand" className="w-full">
                <Link href={authHref("/signup", { next: invitePath, email: invite.email })}>
                  Criar conta e aceitar
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={authHref("/login", { next: invitePath, email: invite.email })}>
                  Já tenho conta
                </Link>
              </Button>
            </>
          )}

          {user && isInvitedUser && <AcceptInviteButton token={params.token} />}

          {user && !isInvitedUser && (
            <>
              <p className="rounded-lg border border-border bg-secondary/50 p-3 text-sm text-muted-foreground">
                Você está conectado como{" "}
                <span className="font-medium text-foreground">{user.email}</span>. Entre com{" "}
                <span className="font-medium text-foreground">{invite.email}</span> para aceitar.
              </p>
              <SwitchAccountButton next={invitePath} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
