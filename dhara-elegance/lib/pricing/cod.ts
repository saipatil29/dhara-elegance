/**
 * Cash on Delivery eligibility.
 *
 * Rule: COD is available only when the final payable amount is
 * STRICTLY GREATER THAN the threshold.
 *
 *   ₹499.99 -> not eligible
 *   ₹500.00 -> not eligible   (boundary is exclusive)
 *   ₹500.01 -> eligible
 *
 * Amounts are handled in paise internally to avoid float drift.
 */

import { COD_MINIMUM_AMOUNT_FALLBACK } from "@/lib/constants";

export const COD_UNAVAILABLE_MESSAGE =
  "Cash on Delivery is available on orders above ₹500.";

function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function isCodEligible(
  payableAmount: number,
  options: { threshold?: number; codEnabled?: boolean } = {}
): boolean {
  const { threshold = COD_MINIMUM_AMOUNT_FALLBACK, codEnabled = true } = options;

  if (!codEnabled) return false;
  if (!Number.isFinite(payableAmount) || payableAmount <= 0) return false;

  return toPaise(payableAmount) > toPaise(threshold);
}

export function codUnavailableMessage(threshold: number): string {
  return `Cash on Delivery is available on orders above ₹${threshold.toLocaleString(
    "en-IN"
  )}.`;
}
