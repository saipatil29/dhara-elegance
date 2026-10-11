import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { serverEnv } from "@/lib/env";

const bodySchema = z.object({ orderId: z.string().uuid() });

/**
 * Creates the Razorpay order for an already-created local order.
 * The amount comes from OUR `orders` row (set authoritatively by
 * create_order()) — the client only ever supplies which order it
 * is paying for, never how much.
 */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }

    // RLS (orders_select_own) ensures this only returns a row the
    // caller actually owns.
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, total, payment_method, payment_status, user_id")
      .eq("id", parsed.data.orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    if (order.payment_method !== "razorpay") {
      return NextResponse.json(
        { error: "This order is not set up for online payment." },
        { status: 400 }
      );
    }
    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "This order is already paid." }, { status: 409 });
    }

    const razorpayOrder = await createRazorpayOrder({
      amountInRupees: Number(order.total),
      receipt: order.order_number,
      notes: { dhara_order_id: order.id },
    });

    // Persist the razorpay_order_id so the webhook can find our
    // order later even if the browser never returns (closed tab,
    // crashed device, etc). Service role: this write does not
    // belong to a customer-facing RLS policy — nobody should be
    // able to edit payments rows directly.
    const admin = createAdminClient();
    await admin
      .from("payments")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("order_id", order.id);

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: serverEnv.razorpayKeyId,
      orderNumber: order.order_number,
    });
  } catch (err) {
    console.error("[razorpay/create-order] error:", err);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 500 }
    );
  }
}
