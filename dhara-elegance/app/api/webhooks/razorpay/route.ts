import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

/**
 * Razorpay webhook — the DURABLE source of truth for payment state.
 * Runs with zero user session (Razorpay calls this server-to-server),
 * so it uses the service-role client throughout. Every state change
 * still goes through mark_payment_paid/mark_payment_failed, which
 * are themselves idempotent — but this route adds a second,
 * independent idempotency layer via webhook_events, so a payload
 * Razorpay retries (it does, on non-2xx or timeout) is recorded
 * once and only processed once.
 *
 * IMPORTANT: signature verification requires the RAW request body,
 * not the parsed JSON — parsing and re-stringifying can change byte
 * layout and break the signature check. We read text() first and
 * parse it ourselves afterward.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-razorpay-signature");

  if (!signatureHeader) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const isValid = verifyWebhookSignature({ rawBody, signatureHeader });
  if (!isValid) {
    console.error("[razorpay webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let payload: {
    id?: string;
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id: string;
          order_id: string;
          status: string;
          error_code?: string;
          error_description?: string;
          notes?: Record<string, string>;
        };
      };
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload." }, { status: 400 });
  }

  const eventId = payload.id;
  const eventType = payload.event;

  if (!eventId || !eventType) {
    return NextResponse.json({ error: "Missing event metadata." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotency: try to record this event. If it already exists
  // (unique on provider+event_id), check whether it was actually
  // PROCESSED before deciding what to do — this is the distinction
  // that matters:
  //   - already processed  -> genuine duplicate delivery, skip.
  //   - recorded but not processed -> our previous attempt failed
  //     partway through; this retry should actually reprocess it,
  //     not be silently dropped.
  const { error: insertError } = await admin.from("webhook_events").insert({
    provider: "razorpay",
    event_id: eventId,
    event_type: eventType,
    payload: payload as unknown as Record<string, unknown>,
  });

  if (insertError) {
    if (insertError.code !== "23505") {
      console.error("[razorpay webhook] failed to record event:", insertError);
      return NextResponse.json({ error: "Could not record event." }, { status: 500 });
    }

    const { data: existing } = await admin
      .from("webhook_events")
      .select("processed")
      .eq("provider", "razorpay")
      .eq("event_id", eventId)
      .maybeSingle();

    if (existing?.processed) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    // else: fall through and reprocess — previous attempt didn't finish.
  }

  try {
    const payment = payload.payload?.payment?.entity;
    const dharaOrderId = payment?.notes?.dhara_order_id;

    if (payment && dharaOrderId) {
      if (eventType === "payment.captured" || eventType === "order.paid") {
        const { error } = await admin.rpc("mark_payment_paid", {
          p_order_id: dharaOrderId,
          p_razorpay_order_id: payment.order_id,
          p_razorpay_payment_id: payment.id,
          p_razorpay_signature: signatureHeader,
        });
        if (error) throw error;
      } else if (eventType === "payment.failed") {
        const { error } = await admin.rpc("mark_payment_failed", {
          p_order_id: dharaOrderId,
          p_error_code: payment.error_code ?? null,
          p_error_description: payment.error_description ?? null,
        });
        if (error) throw error;
      }
      // Other event types (refund.*, order.notification, etc.) are
      // recorded in webhook_events above but have no handler yet —
      // deliberately not implemented in this phase; see report.
    }

    await admin
      .from("webhook_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("provider", "razorpay")
      .eq("event_id", eventId);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[razorpay webhook] processing failed:", err);
    await admin
      .from("webhook_events")
      .update({
        error_message: err instanceof Error ? err.message : "Unknown error",
      })
      .eq("provider", "razorpay")
      .eq("event_id", eventId);

    // 500 so Razorpay retries. Because the row above is recorded but
    // NOT marked processed, the next delivery attempt takes the
    // "recorded but not processed" branch above and genuinely
    // reprocesses rather than being dropped as a duplicate.
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}
