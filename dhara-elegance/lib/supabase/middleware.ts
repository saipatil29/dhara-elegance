import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";

/**
 * Refreshes the Supabase auth session on every matched request and
 * returns both the (possibly cookie-updated) response and the current
 * user, so middleware can make routing decisions without a second
 * round-trip.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: getUser() revalidates the JWT against Supabase.
  // Never trust getSession() for authorization decisions — it only
  // reads the cookie and does not verify it.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, supabase, user };
}
