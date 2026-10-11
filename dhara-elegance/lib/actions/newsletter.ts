"use server";

import { createClient } from "@/lib/supabase/server";
import { newsletterSchema } from "@/lib/validations/common";
import type { ActionResult } from "@/types";

/**
 * Deliberately a plain insert, not an upsert. The RLS policy
 * `newsletter_insert_any` grants anon/authenticated INSERT only —
 * there is intentionally no public UPDATE policy on this table (only
 * admins can update subscriber rows), so an upsert's ON CONFLICT DO
 * UPDATE branch would be rejected by RLS for a repeat subscriber.
 * A unique-constraint violation on retry is therefore expected and
 * harmless: it just means they're already on the list.
 */
export async function subscribeToNewsletter(input: unknown): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({
    email: parsed.data.email,
    is_subscribed: true,
    source: "homepage",
  });

  if (error) {
    if (error.code === "23505") {
      // Already subscribed — treat as success, not an error.
      return { success: true, data: undefined };
    }
    console.error("[newsletter] subscribe failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true, data: undefined };
}
