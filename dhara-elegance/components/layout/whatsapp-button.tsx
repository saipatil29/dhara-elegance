"use client";

import { MessageCircle } from "lucide-react";

import { publicEnv } from "@/lib/env";

/**
 * Floating WhatsApp entry point. Generates the deep-link message
 * dynamically from what the visitor is looking at — never a single
 * hard-coded string — so it works as a general support CTA and, via
 * the optional `context` prop, as a product/cart/order enquiry link.
 */
export function WhatsAppButton({ context }: { context?: string }) {
  const number = publicEnv.whatsappNumber;
  if (!number) return null;

  const message = context
    ? `Hi Dhara Elegance, I have a question about: ${context}`
    : "Hi Dhara Elegance, I'd like some help.";

  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lifted transition-transform duration-300 hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" fill="white" strokeWidth={0} />
    </a>
  );
}
