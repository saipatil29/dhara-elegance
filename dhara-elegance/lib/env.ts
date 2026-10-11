/**
 * Centralised environment access.
 *
 * Two separate objects so that server-only secrets can never be
 * reached from a module that the client bundle imports. `serverEnv`
 * throws if touched in the browser.
 *
 * Note: Next.js inlines `process.env.NEXT_PUBLIC_*` at build time
 * only when referenced by its full literal name, which is why these
 * are written out longhand rather than looked up dynamically.
 */

function required(value: string | undefined, name: string): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Copy .env.example to .env.local and fill it in.`
    );
  }
  return value;
}

/** Safe to reference from Client Components. */
export const publicEnv = {
  get supabaseUrl() {
    return required(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL"
    );
  },
  get supabasePublishableKey() {
    return required(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  },
  get siteUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  },
  get whatsappNumber() {
    return process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER ?? "";
  },
} as const;

function assertServer(name: string) {
  if (typeof window !== "undefined") {
    throw new Error(
      `${name} was accessed in the browser. This is a server-only secret.`
    );
  }
}

/** Server-only. Throws if reached from the browser. */
export const serverEnv = {
  get supabaseServiceRoleKey() {
    assertServer("SUPABASE_SERVICE_ROLE_KEY");
    return required(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      "SUPABASE_SERVICE_ROLE_KEY"
    );
  },
  get razorpayKeyId() {
    assertServer("RAZORPAY_KEY_ID");
    return required(process.env.RAZORPAY_KEY_ID, "RAZORPAY_KEY_ID");
  },
  get razorpayKeySecret() {
    assertServer("RAZORPAY_KEY_SECRET");
    return required(process.env.RAZORPAY_KEY_SECRET, "RAZORPAY_KEY_SECRET");
  },
  get razorpayWebhookSecret() {
    assertServer("RAZORPAY_WEBHOOK_SECRET");
    return required(
      process.env.RAZORPAY_WEBHOOK_SECRET,
      "RAZORPAY_WEBHOOK_SECRET"
    );
  },
  get resendApiKey() {
    assertServer("RESEND_API_KEY");
    return required(process.env.RESEND_API_KEY, "RESEND_API_KEY");
  },
  get emailFrom() {
    assertServer("EMAIL_FROM");
    return process.env.EMAIL_FROM ?? "Dhara Elegance <onboarding@resend.dev>";
  },
  get adminNotificationEmail() {
    assertServer("ADMIN_NOTIFICATION_EMAIL");
    return process.env.ADMIN_NOTIFICATION_EMAIL ?? "";
  },
} as const;
