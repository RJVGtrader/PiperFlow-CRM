"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAppUrl } from "@/lib/app-url";
import { sendInviteEmail } from "@/lib/email/send-invite-email";
import { ACTIVE_WORKSPACE_COOKIE } from "@/lib/supabase/cookies";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getWorkspaces } from "@/lib/workspaces/queries";
import type { MemberRole } from "@/types/workspace";

/**
 * Mutações de workspace, equipe e convites. A checagem de papel aqui é só para
 * dar mensagens melhores: quem decide de fato é a RLS (M8) e as RPCs.
 */

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export interface InviteDelivery {
  email: string;
  /** False quando o Resend não está configurado ou falhou: o admin copia o link. */
  emailSent: boolean;
  inviteUrl: string;
}

const workspaceNameSchema = z.string().trim().min(2).max(50);
const emailSchema = z.string().trim().toLowerCase().email();
const roleSchema = z.enum(["admin", "membro"]);
const idSchema = z.string().uuid();

const NOT_ALLOWED = "Você não tem permissão para fazer isso neste workspace.";

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

function describeDbError(error: PostgrestError, fallback: string) {
  if (error.code === "42501") return NOT_ALLOWED;
  // Mensagens das RPCs e triggers já vêm em português (ex.: último admin).
  if (error.code === "P0001" || error.code === "23514" || error.code === "P0002") {
    return error.message;
  }
  console.error(error);
  return fallback;
}

function setActiveWorkspaceCookie(workspaceId: string) {
  cookies().set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// -----------------------------------------------------------------------------
// Workspaces
// -----------------------------------------------------------------------------

export async function createWorkspace(
  name: string,
  inviteEmails: string[] = []
): Promise<ActionResult<{ workspaceId: string; invites: InviteDelivery[] }>> {
  await requireUser();
  const parsedName = workspaceNameSchema.safeParse(name);
  if (!parsedName.success) return fail("O nome precisa ter entre 2 e 50 caracteres.");

  const supabase = createClient();
  const { data: workspace, error } = await supabase.rpc("create_workspace", {
    workspace_name: parsedName.data,
  });
  if (error || !workspace) return fail("Não foi possível criar o workspace. Tente novamente.");

  setActiveWorkspaceCookie(workspace.id);

  const emails = Array.from(
    new Set(
      inviteEmails
        .map((email) => emailSchema.safeParse(email))
        .flatMap((r) => (r.success ? [r.data] : []))
    )
  );
  const invites: InviteDelivery[] = [];
  for (const email of emails) {
    const result = await createInvite(workspace.id, workspace.name, email, "membro");
    if (result.ok) invites.push(result.data);
  }

  revalidatePath("/", "layout");
  return { ok: true, data: { workspaceId: workspace.id, invites } };
}

export async function switchWorkspace(workspaceId: string): Promise<ActionResult> {
  const workspaces = await getWorkspaces();
  if (!workspaces.some((workspace) => workspace.id === workspaceId)) {
    return fail("Você não faz parte desse workspace.");
  }
  setActiveWorkspaceCookie(workspaceId);
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

export async function renameWorkspace(workspaceId: string, name: string): Promise<ActionResult> {
  await requireUser();
  const parsedName = workspaceNameSchema.safeParse(name);
  if (!idSchema.safeParse(workspaceId).success || !parsedName.success) {
    return fail("O nome precisa ter entre 2 e 50 caracteres.");
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .update({ name: parsedName.data })
    .eq("id", workspaceId)
    .select("id");

  if (error) return fail(describeDbError(error, "Não foi possível salvar. Tente novamente."));
  // RLS de UPDATE filtra silenciosamente: 0 linhas = não é admin.
  if (data.length === 0) return fail(NOT_ALLOWED);

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

// -----------------------------------------------------------------------------
// Convites
// -----------------------------------------------------------------------------

async function deliverInvite(params: {
  token: string;
  email: string;
  role: MemberRole;
  workspaceName: string;
}): Promise<InviteDelivery> {
  const user = await requireUser();
  const inviteUrl = `${getAppUrl()}/invite/${params.token}`;
  const emailSent = await sendInviteEmail({
    to: params.email,
    workspaceName: params.workspaceName,
    invitedByName: user.name,
    role: params.role,
    inviteUrl,
  });
  return { email: params.email, emailSent, inviteUrl };
}

async function createInvite(
  workspaceId: string,
  workspaceName: string,
  email: string,
  role: MemberRole
): Promise<ActionResult<InviteDelivery>> {
  const user = await requireUser();
  const supabase = createClient();

  // Admin enxerga os perfis da equipe (RLS), então dá para checar duplicidade.
  const { data: existing } = await supabase
    .from("workspace_members")
    .select("id, profile:profiles!inner(email)")
    .eq("workspace_id", workspaceId)
    .eq("profile.email", email)
    .limit(1);
  if (existing && existing.length > 0) return fail("Essa pessoa já é membro do workspace.");

  const { data: invite, error } = await supabase
    .from("workspace_invites")
    .insert({ workspace_id: workspaceId, email, role, invited_by: user.id })
    .select("token")
    .single();

  if (error) {
    if (error.code === "23505") return fail("Já existe um convite pendente para esse e-mail.");
    return fail(describeDbError(error, "Não foi possível criar o convite. Tente novamente."));
  }

  const delivery = await deliverInvite({ token: invite.token, email, role, workspaceName });
  return { ok: true, data: delivery };
}

export async function inviteMember(
  workspaceId: string,
  email: string,
  role: MemberRole
): Promise<ActionResult<InviteDelivery>> {
  const parsedEmail = emailSchema.safeParse(email);
  const parsedRole = roleSchema.safeParse(role);
  if (!parsedEmail.success || !parsedRole.success) return fail("Informe um e-mail válido.");

  const workspace = (await getWorkspaces()).find((item) => item.id === workspaceId);
  if (!workspace) return fail("Workspace não encontrado.");

  const result = await createInvite(
    workspace.id,
    workspace.name,
    parsedEmail.data,
    parsedRole.data
  );
  revalidatePath("/settings", "layout");
  return result;
}

export async function resendInvite(inviteId: string): Promise<ActionResult<InviteDelivery>> {
  await requireUser();
  if (!idSchema.safeParse(inviteId).success) return fail("Convite não encontrado.");

  const supabase = createClient();
  const now = new Date();
  const { data: invite, error } = await supabase
    .from("workspace_invites")
    .update({
      last_sent_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 7 * 86_400_000).toISOString(),
    })
    .eq("id", inviteId)
    .select("token, email, role, workspace:workspaces!inner(name)")
    .maybeSingle();

  if (error) return fail(describeDbError(error, "Não foi possível reenviar. Tente novamente."));
  if (!invite) return fail(NOT_ALLOWED);

  const delivery = await deliverInvite({
    token: invite.token,
    email: invite.email,
    role: invite.role,
    workspaceName: invite.workspace.name,
  });
  revalidatePath("/settings", "layout");
  return { ok: true, data: delivery };
}

export async function cancelInvite(inviteId: string): Promise<ActionResult> {
  await requireUser();
  if (!idSchema.safeParse(inviteId).success) return fail("Convite não encontrado.");

  const supabase = createClient();
  const { data, error } = await supabase
    .from("workspace_invites")
    .delete()
    .eq("id", inviteId)
    .select("id");

  if (error) return fail(describeDbError(error, "Não foi possível cancelar. Tente novamente."));
  if (data.length === 0) return fail(NOT_ALLOWED);

  revalidatePath("/settings", "layout");
  return { ok: true, data: undefined };
}

export async function acceptInvite(token: string): Promise<ActionResult> {
  await requireUser();
  if (!idSchema.safeParse(token).success) return fail("Convite inválido ou já utilizado.");

  const supabase = createClient();
  const { data: workspaceId, error } = await supabase.rpc("accept_invite", {
    invite_token: token,
  });
  if (error || !workspaceId) {
    // Mensagens da RPC já são escritas para o usuário final.
    return fail(error?.message ?? "Não foi possível aceitar o convite.");
  }

  setActiveWorkspaceCookie(workspaceId);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// -----------------------------------------------------------------------------
// Membros
// -----------------------------------------------------------------------------

export async function updateMemberRole(memberId: string, role: MemberRole): Promise<ActionResult> {
  await requireUser();
  const parsedRole = roleSchema.safeParse(role);
  if (!idSchema.safeParse(memberId).success || !parsedRole.success) {
    return fail("Papel inválido.");
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .update({ role: parsedRole.data })
    .eq("id", memberId)
    .select("id");

  if (error) return fail(describeDbError(error, "Não foi possível alterar o papel."));
  if (data.length === 0) return fail(NOT_ALLOWED);

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

export async function removeMember(memberId: string): Promise<ActionResult> {
  await requireUser();
  if (!idSchema.safeParse(memberId).success) return fail("Membro não encontrado.");

  const supabase = createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("id", memberId)
    .select("id");

  if (error) return fail(describeDbError(error, "Não foi possível remover o membro."));
  if (data.length === 0) return fail(NOT_ALLOWED);

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}
