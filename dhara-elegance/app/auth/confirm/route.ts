import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Landing point for Supabase's email confirmation and password-
 * recovery links. Uses the token_hash + type OTP-verification flow,
 * which is the default for Supabase's built-in email templates
 * (Confirm signup / Reset password).
 *
 * NOTE: if this Supabase project's email templates are instead
 * configured for the PKCE `code` exchange flow, this route would
 * need `supabase.auth.exchangeCodeForSession(code)` instead — I
 * cannot verify which flow a specific project's dashboard is set to
 * without access to it. Flagged as unverified in the final report.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/account";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=invalid_link`);
}
