"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { authHref, getAppUrl, safeNextPath } from "@/lib/app-url";
import { ACTIVE_WORKSPACE_COOKIE, SESSION_ONLY_COOKIE } from "@/lib/supabase/cookies";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = { error: string } | { needsConfirmation: true; email: string };

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  remember: z.boolean(),
});

const signUpSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
});

function translateAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (normalized.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";
  }
  if (normalized.includes("already registered")) return "Já existe uma conta com esse e-mail.";
  if (normalized.includes("email rate limit") || normalized.includes("sending confirmation")) {
    return "Não conseguimos enviar o e-mail de confirmação agora. Tente novamente em alguns minutos.";
  }
  if (normalized.includes("rate limit")) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.";
  }
  if (normalized.includes("password")) return "Senha fraca: use pelo menos 8 caracteres.";
  console.error("Erro não mapeado do Supabase Auth:", message);
  return "Não foi possível concluir agora. Tente novamente.";
}

export async function signIn(
  values: z.input<typeof signInSchema>,
  next?: string | null
): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return { error: "Informe e-mail e senha válidos." };
  const { email, password, remember } = parsed.data;

  const supabase = createClient({ sessionOnly: !remember });
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translateAuthError(error.message) };

  // Lido pelo middleware nas renovações seguintes da sessão.
  if (remember) {
    cookies().delete(SESSION_ONLY_COOKIE);
  } else {
    cookies().set(SESSION_ONLY_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/" });
  }

  redirect(safeNextPath(next, "/dashboard"));
}

export async function signUp(
  values: z.input<typeof signUpSchema>,
  next?: string | null
): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) return { error: "Revise os dados do cadastro." };
  const { name, email, password } = parsed.data;

  const destination = safeNextPath(next, "/onboarding");
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${getAppUrl()}/callback?next=${encodeURIComponent(destination)}`,
    },
  });

  if (error) return { error: translateAuthError(error.message) };

  // Com confirmação de e-mail ligada, o Supabase não revela se o e-mail já existe:
  // devolve um usuário sem identidades.
  if (data.user && data.user.identities?.length === 0) {
    return { error: "Já existe uma conta com esse e-mail." };
  }

  if (!data.session) return { needsConfirmation: true, email };

  redirect(destination);
}

/** `next`: para onde voltar após entrar de novo (ex.: convite aberto com a conta errada). */
export async function signOut(next?: string) {
  const supabase = createClient();
  await supabase.auth.signOut();
  cookies().delete(SESSION_ONLY_COOKIE);
  cookies().delete(ACTIVE_WORKSPACE_COOKIE);
  const destination = safeNextPath(next, "");
  redirect(destination ? authHref("/login", { next: destination }) : "/login");
}
