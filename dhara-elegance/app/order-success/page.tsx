import Link from "next/link";
import { CheckCircle, ShoppingBag, Clock } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";

interface OrderSuccessPageProps {
  searchParams: Promise<{ orderId?: string; paymentPending?: string }>;
}

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const { orderId, paymentPending } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS (orders_select_own) means this only ever returns a row the
  // signed-in visitor actually owns — no IDOR risk from a guessed
  // orderId in the URL.
  const order = orderId && user
    ? (
        await supabase
          .from("orders")
          .select("order_number, total, payment_method, payment_status, status")
          .eq("id", orderId)
          .maybeSingle()
      ).data
    : null;

  return (
    <main className="min-h-screen bg-cream px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-subtle">
          {paymentPending ? (
            <Clock className="h-9 w-9 text-gold" />
          ) : (
            <CheckCircle className="h-9 w-9 text-success" />
          )}
        </div>

        <p className="mt-8 text-xs font-medium uppercase tracking-editorial text-gold">
          Dhara Elegance
        </p>

        <h1 className="mt-3 font-display text-4xl font-semibold text-navy">
          {paymentPending ? "Order Received — Confirming Payment" : "Order Placed Successfully"}
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          {paymentPending
            ? "We've received your order and are confirming your payment. You'll see it update shortly in Order History."
            : "Thank you for shopping with Dhara Elegance. A confirmation has been recorded for your order."}
        </p>

        {order && (
          <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-navy/10 bg-white p-6 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Number</span>
              <span className="font-mono font-medium text-navy">{order.order_number}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium text-navy">{formatCurrency(Number(order.total))}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-medium capitalize text-navy">
                {order.payment_method === "cod" ? "Cash on Delivery" : order.payment_status}
              </span>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/collections">
              <ShoppingBag className="h-4 w-4" /> Continue Shopping
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/account/orders">View Order History</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
