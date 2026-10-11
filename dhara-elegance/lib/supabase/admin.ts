import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { publicEnv, serverEnv } from "@/lib/env";

/**
 * SERVICE-ROLE CLIENT — BYPASSES ALL ROW LEVEL SECURITY.
 *
 * The `server-only` import above makes the build fail if this module
 * is ever pulled into a Client Component bundle. ESLint also blocks
 * importing it outside server code.
 *
 * Legitimate uses are narrow:
 *   - Razorpay webhook handlers (no user session exists)
 *   - seeding / migration scripts
 *   - background reconciliation jobs
 *
 * Anything that happens on behalf of a signed-in user — including
 * every admin-portal action — must use lib/supabase/server.ts so
 * that RLS still applies.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    publicEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
