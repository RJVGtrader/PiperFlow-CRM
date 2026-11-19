"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Mail, RotateCw, Sparkles, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { InviteDeliveryNotice } from "@/components/settings/invite-delivery-notice";
import { useWorkspaceTeam } from "@/components/settings/team-provider";
import { useWorkspace } from "@/components/shell/workspace-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, getInitials } from "@/lib/utils";
import type { ActionResult, InviteDelivery } from "@/lib/workspaces/actions";
import type { MemberRole, WorkspaceMember } from "@/types/workspace";

const roleOptions: { value: MemberRole; label: string; description: string }[] = [
  { value: "membro", label: "Membro", description: "Leads, negócios e atividades" },
  { value: "admin", label: "Admin", description: "Acesso total, incluindo equipe e plano" },
];

const roleLabels: Record<MemberRole, string> = { admin: "Admin", membro: "Membro" };

const inviteSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail.").email("Informe um e-mail válido."),
  role: z.enum(["admin", "membro"]),
});

type InviteValues = z.infer<typeof inviteSchema>;

/** Executa uma Server Action da equipe, guardando o erro (se houver) para exibir. */
function useTeamAction() {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [delivery, setDelivery] = React.useState<InviteDelivery | null>(null);

  function run(action: () => Promise<ActionResult<unknown>>) {
    setError(null);
    setDelivery(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
      } else if (result.data && typeof result.data === "object" && "inviteUrl" in result.data) {
        setDelivery(result.data as InviteDelivery);
      }
    });
  }

  return { run, isPending, error, delivery };
}

export function MembersSettings() {
  const { current } = useWorkspace();
  const team = useWorkspaceTeam();
  const action = useTeamAction();

  return (
    <div className="space-y-6">
      {team.canManage && <InviteCard key={current.id} />}

      {action.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {action.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Membros ({team.members.length})</CardTitle>
          <CardDescription>
            Pessoas com acesso aos leads e negócios de {current.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Entrou em</TableHead>
                  {team.canManage && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.members.map((member) => {
                  const isSelf = member.id === team.currentMember?.id;

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <span className="flex items-center gap-2 font-medium text-foreground">
                              <span className="truncate">{member.name}</span>
                              {isSelf && (
                                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                                  Você
                                </Badge>
                              )}
                            </span>
                            <span className="block truncate text-sm text-muted-foreground">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {team.canManage && !isSelf ? (
                          <Select
                            value={member.role}
                            disabled={action.isPending}
                            onValueChange={(role) =>
                              action.run(() => team.updateRole(member.id, role as MemberRole))
                            }
                          >
                            <SelectTrigger
                              className="h-8 w-[7.5rem]"
                              aria-label={`Papel de ${member.name}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roleOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={member.role === "admin" ? "brand" : "secondary"}>
                            {roleLabels[member.role]}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(member.joinedAt)}
                      </TableCell>
                      {team.canManage && (
                        <TableCell className="text-right">
                          {!isSelf && (
                            <RemoveMemberDialog
                              member={member}
                              onConfirm={(memberId) =>
                                action.run(() => team.removeMember(memberId))
                              }
                            />
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {team.invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Convites pendentes ({team.invites.length})</CardTitle>
            <CardDescription>
              Ainda não aceitos.
              {team.seatLimit !== null && " Convites pendentes contam no limite do plano Free."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {action.delivery && <InviteDeliveryNotice delivery={action.delivery} />}
            <ul className="divide-y divide-border rounded-lg border border-border">
              {team.invites.map((invite) => (
                <li
                  key={invite.id}
                  className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Mail className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-medium">{invite.email}</span>
                      <span className="block text-xs text-muted-foreground">
                        {roleLabels[invite.role]} · enviado em {formatDate(invite.sentAt)}
                      </span>
                    </div>
                  </div>
                  {team.canManage && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={action.isPending}
                        onClick={() => action.run(() => team.resendInvite(invite.id))}
                      >
                        <RotateCw className="size-3.5" />
                        Reenviar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        disabled={action.isPending}
                        onClick={() => action.run(() => team.cancelInvite(invite.id))}
                      >
                        <X className="size-3.5" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InviteCard() {
  const { current } = useWorkspace();
  const team = useWorkspaceTeam();
  const [delivery, setDelivery] = React.useState<InviteDelivery | null>(null);

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "membro" },
  });

  async function onSubmit(values: InviteValues) {
    const email = values.email.toLowerCase();

    if (team.members.some((member) => member.email === email)) {
      form.setError("email", { message: "Essa pessoa já é membro do workspace." });
      return;
    }
    if (team.invites.some((invite) => invite.email === email)) {
      form.setError("email", { message: "Já existe um convite pendente para esse e-mail." });
      return;
    }

    const result = await team.inviteMember(email, values.role);
    if (!result.ok) {
      form.setError("email", { message: result.error });
      return;
    }
    form.reset({ email: "", role: values.role });
    setDelivery(result.data);
  }

  const { seatLimit, seatsUsed, isAtSeatLimit } = team;
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-base">Convidar colaborador</CardTitle>
          <CardDescription>
            A pessoa recebe um link por e-mail para entrar no workspace.
          </CardDescription>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {seatLimit === null ? `${seatsUsed} assentos` : `${seatsUsed}/${seatLimit} assentos`}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAtSeatLimit ? (
          <div className="flex flex-col gap-3 rounded-lg border border-brand/30 bg-brand/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  {current.name} atingiu o limite de {seatLimit} colaboradores do plano Free.
                </p>
                <p className="text-sm text-muted-foreground">
                  Faça upgrade para o Pro e convide quantas pessoas precisar.
                </p>
              </div>
            </div>
            <Button variant="brand" size="sm" asChild className="shrink-0">
              <Link href="/settings/billing">Ver planos</Link>
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem_auto] sm:items-start"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="colega@empresa.com"
                        {...field}
                        onChange={(event) => {
                          field.onChange(event);
                          setDelivery(null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Papel</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {roleOptions.find((option) => option.value === field.value)?.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="brand" disabled={isSubmitting} className="sm:mt-8">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar convite"
                )}
              </Button>
            </form>
          </Form>
        )}

        {delivery && <InviteDeliveryNotice delivery={delivery} />}
      </CardContent>
    </Card>
  );
}

function RemoveMemberDialog({
  member,
  onConfirm,
}: {
  member: WorkspaceMember;
  onConfirm: (memberId: string) => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          aria-label={`Remover ${member.name}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover {member.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {member.name} perde o acesso ao workspace. Leads e negócios sob a responsabilidade dessa
            pessoa continuam no workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => onConfirm(member.id)}
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
