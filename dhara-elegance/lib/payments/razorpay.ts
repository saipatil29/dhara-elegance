import "server-only";

import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "crypto";

import { serverEnv } from "@/lib/env";

/** Server-only Razorpay SDK instance. */
export function getRazorpayClient() {
  return new Razorpay({
    key_id: serverEnv.razorpayKeyId,
    key_secret: serverEnv.razorpayKeySecret,
  });
}

/**
 * Creates a Razorpay order for an amount already computed and
 * persisted by create_order() in the database. `amountInRupees`
 * comes from the local `orders` row — never from the client.
 */
export async function createRazorpayOrder(params: {
  amountInRupees: number;
  receipt: string; // our order_number
  notes?: Record<string, string>;
}) {
  const razorpay = getRazorpayClient();
  const amountInPaise = Math.round(params.amountInRupees * 100);

  return razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: params.receipt,
    payment_capture: true,
    notes: params.notes,
  });
}

/**
 * Verifies the signature Razorpay Checkout hands back to the
 * browser after a payment attempt.
 *
 * Algorithm per Razorpay's documented spec:
 *   expected = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
 *   valid    = expected === razorpay_signature
 *
 * Implemented directly with Node's `crypto` (rather than an SDK
 * utility import path that can move between package versions) and
 * compared with a constant-time comparison to avoid a timing
 * side-channel.
 */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  const expected = createHmac("sha256", serverEnv.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(razorpaySignature, "hex");

  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Verifies a webhook payload's signature. Razorpay signs the RAW
 * request body (not the parsed JSON) with the webhook secret — the
 * caller must pass the untouched request text.
 */
export function verifyWebhookSignature(params: {
  rawBody: string;
  signatureHeader: string;
}): boolean {
  const expected = createHmac("sha256", serverEnv.razorpayWebhookSecret)
    .update(params.rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(params.signatureHeader, "hex");

  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
