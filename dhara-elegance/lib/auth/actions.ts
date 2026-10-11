"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import type { ActionResult } from "@/types";

export async function signInWithPassword(input: unknown): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please check your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Supabase returns the same generic message for "no such user"
    // and "wrong password" by design — we pass it through as-is
    // rather than trying to be more specific, which would leak
    // whether an email is registered.
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, data: undefined };
}

export async function signUpWithPassword(input: unknown): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, marketing_opt_in: parsed.data.marketingOptIn },
      emailRedirectTo: `${publicEnv.siteUrl}/auth/confirm?next=/account`,
    },
  });

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${publicEnv.siteUrl}/auth/confirm?next=/auth/reset-password`,
  });

  // Always return success regardless of whether the email exists —
  // revealing which emails are registered is an enumeration risk.
  if (error) console.error("[auth] resetPasswordForEmail error:", error);
  return { success: true, data: undefined };
}

export async function updatePassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please check the password fields." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Your password reset link has expired. Please request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { success: false, error: error.message };

  return { success: true, data: undefined };
}

export async function signOut(redirectTo = "/") {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(redirectTo);
}
