import type { CookieOptions } from "@supabase/ssr";

/**
 * Presente quando o usuário entrou sem "Manter conectado": os cookies de sessão
 * do Supabase passam a ser de sessão do navegador (somem ao fechá-lo).
 */
export const SESSION_ONLY_COOKIE = "pf_session_only";

/** Workspace ativo. Só uma preferência: o servidor sempre valida a membership. */
export const ACTIVE_WORKSPACE_COOKIE = "pf_workspace";

export function withSessionPreference(options: CookieOptions, sessionOnly: boolean) {
  if (!sessionOnly) return options;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { maxAge, expires, ...rest } = options;
  return rest;
}
