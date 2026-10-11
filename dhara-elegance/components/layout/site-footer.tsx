import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Separator } from "@/components/ui/separator";
import { BRAND } from "@/lib/constants";

const EXPLORE_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "Men", href: "/collections/men" },
  { label: "Women", href: "/collections/women" },
  { label: "Best Sellers", href: "/collections?filter=bestseller" },
];

const SUPPORT_LINKS = [
  { label: "Shipping & Returns", href: "/policies/shipping-returns" },
  { label: "Track an Order", href: "/account/orders" },
  { label: "Care Guide", href: "/policies/care" },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-navy/10 bg-navy text-cream">
      <div className="container-editorial grid gap-10 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo variant="mark" size={40} withWordmark withTagline />
          <p className="mt-4 max-w-xs text-sm text-cream/70">{BRAND.description}</p>
          <Link
            href="https://www.instagram.com/dharaelegance.co/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors hover:border-gold hover:text-gold"
          >
            <Instagram className="h-4 w-4" />
          </Link>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-gold">
            Explore
          </h4>
          <ul className="mt-4 space-y-2.5">
            {EXPLORE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-cream/75 transition-colors hover:text-cream">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-gold">
            Customer Care
          </h4>
          <ul className="mt-4 space-y-2.5">
            {SUPPORT_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-cream/75 transition-colors hover:text-cream">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-gold">
            Get in Touch
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-cream/75">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gold" /> care@dharaelegance.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold" /> +91 91040 97343
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold" /> {BRAND.location}
            </li>
          </ul>
        </div>
      </div>

      <Separator className="bg-cream/10" />

      <div className="container-editorial flex flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-cream/50 md:flex-row">
        <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
        <p>{BRAND.tagline}</p>
      </div>
    </footer>
  );
}
