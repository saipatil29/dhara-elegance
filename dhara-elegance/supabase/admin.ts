import { createClient } from "@supabase/supabase-js";

/**
 * Admin client using the service role key. NEVER import this into
 * a Client Component or expose it to the browser — server-only.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
