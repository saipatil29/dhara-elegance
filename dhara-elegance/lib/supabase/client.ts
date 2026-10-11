import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";

/**
 * Supabase client for Client Components.
 *
 * Uses the publishable/anon key only. Every permission this client
 * has is granted by RLS — it is safe to ship to the browser.
 */
export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey
  );
}
