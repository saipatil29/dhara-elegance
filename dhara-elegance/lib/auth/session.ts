import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type AdminRow = Database["public"]["Tables"]["admin_users"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Returns the current user, or null. Uses getUser() — which verifies
 * the JWT with Supabase — rather than getSession(), which only reads
 * a cookie and must never be used for authorization.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Current user's profile row, or null. */
export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data ?? null;
}

/** Redirects to login if not signed in. */
export async function requireUser(redirectTo = "/auth/login") {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

/**
 * Returns the caller's active admin_users row, or null.
 * Read this rather than trusting middleware alone.
 */
export async function getAdminUser(): Promise<AdminRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  return data ?? null;
}

const ROLE_RANK = { staff: 1, admin: 2, super_admin: 3 } as const;
export type AdminRole = keyof typeof ROLE_RANK;

/**
 * Guard for admin pages and server actions. Redirects to the admin
 * login when the caller is not an active admin of sufficient rank.
 */
export async function requireAdmin(minimumRole: AdminRole = "staff") {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login?error=unauthorized");

  if (ROLE_RANK[admin.role] < ROLE_RANK[minimumRole]) {
    redirect("/admin/dashboard?error=insufficient_role");
  }

  return admin;
}
