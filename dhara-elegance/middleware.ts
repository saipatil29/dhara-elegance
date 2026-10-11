import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Runs on every matched request:
 *   1. refreshes the Supabase session cookie
 *   2. gates /admin behind an active admin_users row
 *   3. gates /account and /checkout behind a signed-in user
 *
 * Middleware is the first line of defence, never the only one:
 * every admin page and server action re-checks authorization.
 */
export async function middleware(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  // ---------- Admin ----------
  if (isAdminRoute) {
    if (!user) {
      if (isAdminLogin) return response;
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }

    // Signed in — confirm they are actually an admin.
    const { data: admin } = await supabase
      .from("admin_users")
      .select("id, role, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "?error=unauthorized";
      return NextResponse.redirect(url);
    }

    // Already an admin sitting on the login page — send them in.
    if (isAdminLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return response;
  }

  // ---------- Customer-protected ----------
  const needsAuth =
    pathname.startsWith("/account") || pathname.startsWith("/checkout");

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files. Keeping the
     * matcher tight matters: middleware runs on every request and
     * performs a network call to Supabase.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
