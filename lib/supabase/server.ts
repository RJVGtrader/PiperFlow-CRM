import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/supabase/database.types";
import { SESSION_ONLY_COOKIE, withSessionPreference } from "@/lib/supabase/cookies";

/**
 * Client do Supabase para Server Components, Server Actions e Route Handlers.
 * Usa a anon key + sessão do usuário (cookies): toda query passa pela RLS.
 * `sessionOnly` sobrepõe a preferência do cookie (usado no próprio login).
 */
export function createClient(options: { sessionOnly?: boolean } = {}) {
  const cookieStore = cookies();
  const sessionOnly = options.sessionOnly ?? cookieStore.has(SESSION_ONLY_COOKIE);

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, withSessionPreference(options, sessionOnly))
            );
          } catch {
            // Server Components não gravam cookies; o middleware renova a sessão.
          }
        },
      },
    }
  );
}
