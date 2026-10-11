import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";

/**
 * Supabase client for Server Components, Route Handlers and Server
 * Actions. Must be constructed per-request — never cached in a
 * module-level variable, or you will leak one user's session to
 * another user.
 *
 * Still the anon key: requests run as the signed-in user and remain
 * subject to RLS. That is deliberate — admin writes go through the
 * admin's own session, not a service-role bypass.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component, which cannot write
            // cookies. Safe to ignore: middleware refreshes the
            // session on every request.
          }
        },
      },
    }
  );
}
