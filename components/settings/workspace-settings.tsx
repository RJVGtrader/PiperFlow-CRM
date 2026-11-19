"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useWorkspaceTeam } from "@/components/settings/team-provider";
import { useWorkspace } from "@/components/shell/workspace-provider";
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
import { plans } from "@/lib/plans";
import { renameWorkspace } from "@/lib/workspaces/actions";
import type { Workspace } from "@/types/workspace";

const workspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome precisa ter pelo menos 2 caracteres.")
    .max(50, "Use no máximo 50 caracteres."),
});

type WorkspaceValues = z.infer<typeof workspaceSchema>;

export function WorkspaceSettings() {
  const { current } = useWorkspace();

  // key: ao trocar de workspace na sidebar o formulário recomeça com os dados do novo.
  return <WorkspaceSettingsContent key={current.id} workspace={current} />;
}

function WorkspaceSettingsContent({ workspace }: { workspace: Workspace }) {
  const { members, currentMember, canManage } = useWorkspaceTeam();
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved">("idle");

  const form = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: workspace.name },
  });

  async function onSubmit(values: WorkspaceValues) {
    setStatus("saving");
    const result = await renameWorkspace(workspace.id, values.name);
    if (!result.ok) {
      form.setError("name", { message: result.error });
      setStatus("idle");
      return;
    }
    form.reset(values);
    setStatus("saved");
  }

  const plan = plans[workspace.plan];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do workspace</CardTitle>
          <CardDescription>
            O nome aparece na sidebar e nos convites enviados para a equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do workspace</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Acme Vendas"
                        disabled={!canManage}
                        {...field}
                        onChange={(event) => {
                          field.onChange(event);
                          setStatus("idle");
                        }}
                      />
                    </FormControl>
                    {!canManage && (
                      <FormDescription>Apenas admins podem alterar o workspace.</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {canManage && (
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    variant="brand"
                    disabled={!form.formState.isDirty || status === "saving"}
                  >
                    {status === "saving" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar alterações"
                    )}
                  </Button>
                  {status === "saved" && (
                    <span className="flex items-center gap-1.5 text-sm text-brand">
                      <CheckCircle2 className="size-4" />
                      Alterações salvas
                    </span>
                  )}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Plano</dt>
              <dd className="flex items-center gap-2">
                <Badge variant={workspace.plan === "pro" ? "brand" : "secondary"}>
                  {plan.name}
                </Badge>
                <Link href="/settings/billing" className="text-xs text-brand hover:underline">
                  Gerenciar
                </Link>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Membros</dt>
              <dd className="font-mono font-medium">{members.length}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Seu papel</dt>
              <dd className="font-medium">
                {currentMember?.role === "admin" ? "Admin" : "Membro"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-mono text-xs text-muted-foreground">{workspace.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
