import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import { SESSION_ONLY_COOKIE, withSessionPreference } from "@/lib/supabase/cookies";

const PROTECTED_PREFIXES = ["/dashboard", "/leads", "/pipeline", "/settings", "/onboarding"];
const AUTH_PAGES = ["/login", "/signup"];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Renova a sessão do Supabase a cada request e aplica o redirecionamento de
 * rotas. É só a primeira barreira: páginas e Server Actions checam o usuário de
 * novo e a RLS decide o acesso aos dados.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const sessionOnly = request.cookies.has(SESSION_ONLY_COOKIE);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, withSessionPreference(options, sessionOnly))
          );
        },
      },
    }
  );

  // getUser() valida o token no Supabase Auth (getSession() só lê o cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && matches(pathname, PROTECTED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return redirectWithCookies(url, response);
  }

  if (user && matches(pathname, AUTH_PAGES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return redirectWithCookies(url, response);
  }

  return response;
}

/** Redireciona sem perder os cookies de sessão renovados nesta request. */
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
