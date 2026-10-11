import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";

const bodySchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

/**
 * Called by the browser immediately after Razorpay Checkout's
 * `handler` callback fires. This is a CONVENIENCE fast-path for the
 * UI (so the customer sees a success screen without waiting on a
 * webhook round-trip) — it is NOT the sole source of truth. The
 * webhook route is what makes payment confirmation durable, because
 * this route can be skipped entirely (closed tab, network drop)
 * and Razorpay does not retry it.
 */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment response." }, { status: 400 });
    }
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }

    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .single();
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      // Do not touch order state on a bad signature — this could be
      // a tampered client response. The webhook remains the source
      // of truth and will reconcile the real outcome.
      console.error("[razorpay/verify] signature mismatch for order", orderId);
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error: rpcError } = await admin.rpc("mark_payment_paid", {
      p_order_id: orderId,
      p_razorpay_order_id: razorpayOrderId,
      p_razorpay_payment_id: razorpayPaymentId,
      p_razorpay_signature: razorpaySignature,
    });

    if (rpcError) {
      console.error("[razorpay/verify] mark_payment_paid failed:", rpcError);
      return NextResponse.json(
        { error: "Payment received but confirmation failed. Our team will follow up." },
        { status: 500 }
      );
    }

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error("[razorpay/verify] error:", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
