import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/reveal";

/**
 * Real store-policy content, written to trustworthy-claims standard
 * (no "never tarnishes" / "100% allergy-proof" / "guaranteed
 * forever" absolutes).
 */
const FAQS = [
  {
    q: "Is Dhara Elegance jewellery really waterproof?",
    a: "Yes — our pieces are built to withstand water from showers, swimming, and rain without damaging the finish. We still recommend removing jewellery before prolonged submersion in chlorinated or salt water for the longest-lasting shine.",
  },
  {
    q: "Will my jewellery tarnish over time?",
    a: "Every piece uses an anti-tarnish plating designed to resist discoloration significantly longer than standard finishes. With the basic care in our Care Guide, most customers see their pieces hold their shine for years of daily wear.",
  },
  {
    q: "Is it safe for sensitive skin?",
    a: "Our jewellery is designed to be comfortable for everyday and sensitive skin. As with any jewellery, if you have a known metal allergy, we recommend checking the material listed on each product page.",
  },
  {
    q: "When is Cash on Delivery available?",
    a: "Cash on Delivery is available on orders with a final payable amount above ₹500. For orders at or below ₹500, online payment via Razorpay is required.",
  },
  {
    q: "What's your return and exchange policy?",
    a: "You can request a return or exchange within our standard return window after delivery. We don't offer cash refunds — eligible requests are resolved via exchange or store credit. See our Shipping & Returns page for full details.",
  },
  {
    q: "How long does delivery take?",
    a: "Most orders are dispatched within 24–48 hours and delivered within our standard shipping window. You'll receive tracking details as soon as your order ships.",
  },
];

export function FaqSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-editorial px-5">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-xs font-medium uppercase tracking-editorial text-gold">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
            Common Questions
          </h2>
        </Reveal>

        <Reveal className="mx-auto mt-10 max-w-2xl">
          <Accordion type="single" collapsible>
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
