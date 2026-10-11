import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCheckoutSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const dynamic = "force-dynamic";

/**
 * middleware.ts already redirects unauthenticated visitors to
 * /auth/login before this ever renders — the check here is a
 * second, independent guard (defense in depth), not the primary one.
 */
export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/checkout");

  const [{ data: profile }, { data: defaultAddress }, settings] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    supabase
      .from("addresses")
      .select("full_name, phone, line1, line2, city, state, pincode, country")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
    getCheckoutSettings(),
  ]);

  return (
    <main className="min-h-screen bg-cream px-5 py-12">
      <div className="container-editorial">
        <p className="text-xs font-medium uppercase tracking-editorial text-gold">Dhara Elegance</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-navy">Checkout</h1>

        <CheckoutForm
          settings={settings}
          userEmail={user.email ?? ""}
          prefill={{
            name: defaultAddress?.full_name ?? profile?.full_name ?? "",
            phone: defaultAddress?.phone ?? profile?.phone ?? "",
            line1: defaultAddress?.line1 ?? "",
            line2: defaultAddress?.line2 ?? "",
            city: defaultAddress?.city ?? "",
            state: defaultAddress?.state ?? "",
            pincode: defaultAddress?.pincode ?? "",
          }}
        />
      </div>
    </main>
  );
}
