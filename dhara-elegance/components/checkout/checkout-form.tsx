"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Tag, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/components/providers/cart-provider";
import { checkoutSchema, type CheckoutValues } from "@/lib/validations/checkout";
import { createOrder } from "@/lib/orders/create-order";
import { createClient } from "@/lib/supabase/client";
import { isCodEligible, codUnavailableMessage } from "@/lib/pricing/cod";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/payments/razorpay-client";
import { formatCurrency } from "@/utils/format";
import type { CheckoutSettings } from "@/lib/settings";

interface CouponPreview {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount: number | null;
}

export function CheckoutForm({
  settings,
  userEmail,
  prefill,
}: {
  settings: CheckoutSettings;
  userEmail: string;
  prefill: {
    name: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
}) {
  const router = useRouter();
  const { items, totalPrice, clearCart, isReady } = useCart();

  const [couponInput, setCouponInput] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<CouponPreview | null>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = React.useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: prefill.name,
      customerEmail: userEmail,
      customerPhone: prefill.phone,
      addressLine1: prefill.line1,
      addressLine2: prefill.line2,
      city: prefill.city,
      state: prefill.state,
      pincode: prefill.pincode,
      country: "India",
      items: [],
      paymentMethod: "razorpay",
      couponCode: "",
    },
  });

  const paymentMethod = watch("paymentMethod");

  // checkoutSchema requires items.min(1), and zodResolver validates
  // whatever is currently in RHF's internal form state — NOT
  // whatever we pass to createOrder() at submit time. Without this,
  // `items` would stay at its default `[]` (it isn't bound to any
  // visible input) and every submission would fail validation even
  // with a full cart.
  React.useEffect(() => {
    setValue(
      "items",
      items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      { shouldValidate: false }
    );
  }, [items, setValue]);

  // Client-side ESTIMATE only — for display and to decide which
  // payment options to SHOW. The authoritative number that actually
  // governs COD eligibility, discount, and the charged amount is
  // recomputed from scratch inside create_order() on the server.
  const estimatedDiscount = React.useMemo(() => {
    if (!appliedCoupon) return 0;
    if (totalPrice < appliedCoupon.minimumOrderAmount) return 0;
    let discount =
      appliedCoupon.discountType === "percentage"
        ? (totalPrice * appliedCoupon.discountValue) / 100
        : appliedCoupon.discountValue;
    if (appliedCoupon.maximumDiscountAmount != null) {
      discount = Math.min(discount, appliedCoupon.maximumDiscountAmount);
    }
    return Math.min(discount, totalPrice);
  }, [appliedCoupon, totalPrice]);

  const estimatedAfterDiscount = totalPrice - estimatedDiscount;
  const estimatedShipping =
    estimatedAfterDiscount >= settings.freeShippingThreshold ? 0 : settings.flatShippingRate;
  const estimatedTotal = estimatedAfterDiscount + estimatedShipping;

  const codEligible = isCodEligible(estimatedTotal, {
    threshold: settings.codMinimumAmount,
    codEnabled: settings.codEnabled,
  });

  React.useEffect(() => {
    if (!codEligible && paymentMethod === "cod") {
      setValue("paymentMethod", "razorpay");
    }
  }, [codEligible, paymentMethod, setValue]);

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setIsCheckingCoupon(true);
    setCouponError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("coupons")
      .select("code, discount_type, discount_value, minimum_order_amount, maximum_discount_amount")
      .eq("code", couponInput.trim().toUpperCase())
      .maybeSingle();
    // RLS (coupons_public_select_valid) already restricts this to
    // currently-active, in-date-range coupons — a miss here means
    // "not valid" without needing extra client-side date checks.

    setIsCheckingCoupon(false);

    if (error || !data) {
      setCouponError("This coupon code isn't valid.");
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon({
      code: data.code,
      discountType: data.discount_type,
      discountValue: Number(data.discount_value),
      minimumOrderAmount: Number(data.minimum_order_amount),
      maximumDiscountAmount:
        data.maximum_discount_amount != null ? Number(data.maximum_discount_amount) : null,
    });
    setValue("couponCode", data.code);
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setValue("couponCode", "");
  }

  async function onSubmit(values: CheckoutValues) {
    if (items.length === 0) {
      toast.error("Your bag is empty.");
      return;
    }

    setIsPlacingOrder(true);
    setServerError(null);

    const result = await createOrder({
      ...values,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    });

    if (!result.success) {
      setServerError(result.error);
      setIsPlacingOrder(false);
      return;
    }

    const { orderId, orderNumber, total, requiresPayment } = result.data;

    if (!requiresPayment) {
      // COD — order is already created and confirmed server-side.
      await clearCart();
      router.push(`/order-success?orderId=${orderId}`);
      return;
    }

    try {
      await loadRazorpayScript();

      const createRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData.error || "Could not start payment.");
      }

      openRazorpayCheckout({
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        order_id: createData.razorpayOrderId,
        name: "Dhara Elegance",
        description: `Order ${orderNumber}`,
        notes: { dhara_order_id: orderId },
        prefill: {
          name: values.customerName,
          email: values.customerEmail,
          contact: values.customerPhone,
        },
        theme: { color: "#0F2345" },
        handler: async (response) => {
          const verifyRes = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          if (verifyRes.ok) {
            await clearCart();
            router.push(`/order-success?orderId=${orderId}`);
          } else {
            router.push(`/order-success?orderId=${orderId}&paymentPending=1`);
          }
        },
        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false);
            toast.info("Payment cancelled. Your order is saved — you can retry payment from Order History.");
          },
        },
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not start payment.");
      setIsPlacingOrder(false);
    }
  }

  if (isReady && items.length === 0) {
    return (
      <div className="mt-12 rounded-2xl border border-dashed border-navy/15 p-16 text-center">
        <p className="text-sm text-muted-foreground">Your bag is empty — add something first.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
      <section className="space-y-8 rounded-2xl border border-navy/8 bg-white p-6 sm:p-8">
        <div>
          <h2 className="font-display text-xl font-semibold text-navy">Contact Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="customerName">Full Name</Label>
              <Input id="customerName" className="mt-1.5" {...register("customerName")} />
              {errors.customerName && <p className="mt-1 text-xs text-destructive">{errors.customerName.message}</p>}
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone</Label>
              <Input id="customerPhone" className="mt-1.5" {...register("customerPhone")} />
              {errors.customerPhone && <p className="mt-1 text-xs text-destructive">{errors.customerPhone.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input id="customerEmail" type="email" className="mt-1.5" {...register("customerEmail")} />
              {errors.customerEmail && <p className="mt-1 text-xs text-destructive">{errors.customerEmail.message}</p>}
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-navy">Delivery Address</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input id="addressLine1" className="mt-1.5" {...register("addressLine1")} />
              {errors.addressLine1 && <p className="mt-1 text-xs text-destructive">{errors.addressLine1.message}</p>}
            </div>
            <div>
              <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
              <Input id="addressLine2" className="mt-1.5" {...register("addressLine2")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" className="mt-1.5" {...register("city")} />
                {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" className="mt-1.5" {...register("state")} />
                {errors.state && <p className="mt-1 text-xs text-destructive">{errors.state.message}</p>}
              </div>
              <div>
                <Label htmlFor="pincode">PIN Code</Label>
                <Input id="pincode" inputMode="numeric" maxLength={6} className="mt-1.5" {...register("pincode")} />
                {errors.pincode && <p className="mt-1 text-xs text-destructive">{errors.pincode.message}</p>}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-navy">Payment Method</h2>
          <div className="mt-4 space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-navy/15 p-4 has-[:checked]:border-gold has-[:checked]:bg-gold/5">
              <input type="radio" value="razorpay" className="h-4 w-4 accent-navy" {...register("paymentMethod")} />
              <div>
                <p className="text-sm font-medium text-navy">Online Payment</p>
                <p className="text-xs text-muted-foreground">Secure payment via Razorpay — cards, UPI, wallets</p>
              </div>
            </label>

            <label
              className={
                codEligible
                  ? "flex cursor-pointer items-center gap-3 rounded-xl border border-navy/15 p-4 has-[:checked]:border-gold has-[:checked]:bg-gold/5"
                  : "flex items-center gap-3 rounded-xl border border-navy/10 bg-navy/[0.02] p-4 opacity-50"
              }
            >
              <input
                type="radio"
                value="cod"
                disabled={!codEligible}
                className="h-4 w-4 accent-navy"
                {...register("paymentMethod")}
              />
              <div>
                <p className="text-sm font-medium text-navy">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">
                  {codEligible
                    ? "Pay with cash when your order arrives"
                    : codUnavailableMessage(settings.codMinimumAmount)}
                </p>
              </div>
            </label>
          </div>
        </div>

        {serverError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {serverError}
          </div>
        )}
      </section>

      <aside className="h-fit space-y-6 rounded-2xl border border-navy/8 bg-white p-6">
        <h2 className="font-display text-xl font-semibold text-navy">Order Summary</h2>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId ?? "base"}`} className="flex justify-between text-sm">
              <span className="text-navy/80">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium text-navy">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-navy/10 pt-4">
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-lg bg-gold/10 px-3 py-2 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-navy">
                <Tag className="h-3.5 w-3.5" /> {appliedCoupon.code}
              </span>
              <button type="button" onClick={removeCoupon} aria-label="Remove coupon">
                <X className="h-3.5 w-3.5 text-navy/50" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyCoupon}
                disabled={isCheckingCoupon}
              >
                {isCheckingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
          )}
          {couponError && <p className="mt-1.5 text-xs text-destructive">{couponError}</p>}
        </div>

        <div className="space-y-2 border-t border-navy/10 pt-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
          {estimatedDiscount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>−{formatCurrency(estimatedDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>{estimatedShipping === 0 ? "Free" : formatCurrency(estimatedShipping)}</span>
          </div>
        </div>

        <div className="flex justify-between border-t border-navy/10 pt-4 font-display text-lg font-semibold text-navy">
          <span>Total</span>
          <span>{formatCurrency(estimatedTotal)}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Final total is confirmed securely when your order is placed.
        </p>

        <Button type="submit" size="lg" className="w-full" disabled={isPlacingOrder}>
          {isPlacingOrder ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Placing Order…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" /> Place Order
            </>
          )}
        </Button>
      </aside>
    </form>
  );
}
