import { headers } from "next/headers";

/** URL pública do app, para links em e-mails (convite, confirmação de cadastro). */
export function getAppUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return headers().get("origin") ?? "http://localhost:3000";
}

/**
 * Aceita só caminhos internos em ?next=, evitando open redirect
 * (ex.: //evil.com ou https://evil.com).
 */
export function safeNextPath(next: string | null | undefined, fallback: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}

export type AuthSearchParams = { next?: string; email?: string; error?: string };

/** Mantém ?next= e ?email= (ex.: voltar ao convite) ao alternar entre login e cadastro. */
export function authHref(path: "/login" | "/signup", params: AuthSearchParams) {
  const query = new URLSearchParams();
  if (params.next) query.set("next", params.next);
  if (params.email) query.set("email", params.email);
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}
