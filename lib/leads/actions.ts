"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { leadSchema, NO_OWNER, type LeadFormValues } from "@/lib/leads/schema";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/workspaces/actions";
import { getActiveWorkspace, getCurrentUser } from "@/lib/workspaces/queries";
import type { TablesInsert } from "@/lib/supabase/database.types";

/**
 * Mutações de leads, sempre no workspace ativo (resolvido no servidor, nunca
 * vindo do client). Quem garante o isolamento e as permissões é a RLS.
 */

const idSchema = z.string().uuid();

const NOT_FOUND = "Lead não encontrado ou você não tem permissão para alterá-lo.";

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

function describeDbError(error: PostgrestError, fallback: string) {
  // RLS do insert/update: fora do workspace ou responsável que não é membro.
  if (error.code === "42501") return "Você não tem permissão para fazer isso neste workspace.";
  console.error(error);
  return fallback;
}

async function requireWorkspace() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const workspace = await getActiveWorkspace();
  if (!workspace) redirect("/onboarding");
  return workspace;
}

function toRow(values: LeadFormValues): Omit<TablesInsert<"leads">, "workspace_id"> {
  return {
    name: values.name,
    email: values.email || null,
    phone: values.phone || null,
    company: values.company || null,
    job_title: values.jobTitle || null,
    status: values.status,
    owner_id: values.ownerId === NO_OWNER ? null : values.ownerId,
  };
}

function parseValues(values: LeadFormValues) {
  const parsed = leadSchema.safeParse(values);
  return parsed.success ? parsed.data : null;
}

export async function createLead(values: LeadFormValues): Promise<ActionResult<{ id: string }>> {
  const workspace = await requireWorkspace();
  const data = parseValues(values);
  if (!data) return fail("Confira os campos do formulário.");

  const supabase = createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({ ...toRow(data), workspace_id: workspace.id })
    .select("id")
    .single();

  if (error) return fail(describeDbError(error, "Não foi possível criar o lead. Tente novamente."));

  revalidatePath("/leads", "layout");
  return { ok: true, data: { id: lead.id } };
}

export async function updateLead(leadId: string, values: LeadFormValues): Promise<ActionResult> {
  const workspace = await requireWorkspace();
  if (!idSchema.safeParse(leadId).success) return fail(NOT_FOUND);
  const data = parseValues(values);
  if (!data) return fail("Confira os campos do formulário.");

  const supabase = createClient();
  const { data: rows, error } = await supabase
    .from("leads")
    .update(toRow(data))
    .eq("id", leadId)
    .eq("workspace_id", workspace.id)
    .select("id");

  if (error) return fail(describeDbError(error, "Não foi possível salvar. Tente novamente."));
  // RLS de UPDATE filtra silenciosamente: 0 linhas = lead inexistente ou sem acesso.
  if (rows.length === 0) return fail(NOT_FOUND);

  revalidatePath("/leads", "layout");
  return { ok: true, data: undefined };
}

/**
 * `redirectToList` é usado na página de detalhe: redirecionar no servidor evita
 * que a revalidação renderize o 404 do lead recém-excluído antes de navegar.
 */
export async function deleteLead(
  leadId: string,
  options: { redirectToList?: boolean } = {}
): Promise<ActionResult> {
  const workspace = await requireWorkspace();
  if (!idSchema.safeParse(leadId).success) return fail(NOT_FOUND);

  const supabase = createClient();
  const { data: rows, error } = await supabase
    .from("leads")
    .delete()
    .eq("id", leadId)
    .eq("workspace_id", workspace.id)
    .select("id");

  if (error) return fail(describeDbError(error, "Não foi possível excluir. Tente novamente."));
  if (rows.length === 0) return fail(NOT_FOUND);

  revalidatePath("/leads", "layout");
  if (options.redirectToList) redirect("/leads");
  return { ok: true, data: undefined };
}
