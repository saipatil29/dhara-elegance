import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/utils/cn";

/**
 * Two intentionally different visual treatments in one grid: Men
 * reads darker/bolder (heavier weight type, sharper corners), Women
 * reads softer (lighter weight, warmer overlay) — while both stay
 * inside the shared navy/gold/cream system per the brand identity.
 */
export function ShopByGender() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-editorial px-5">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-xs font-medium uppercase tracking-editorial text-gold">
            Two Worlds, One Standard
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
            Shop by Collection
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <Reveal>
            <Link
              href="/collections/men"
              className={cn(
                "group relative block aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[3/4]"
              )}
            >
              <PlaceholderImage seed={1} className="transition-transform duration-700 ease-luxe group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <p className="text-xs font-semibold uppercase tracking-editorial text-gold-light">
                  For Him
                </p>
                <h3 className="mt-2 font-display text-3xl font-bold text-cream">MEN</h3>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cream/90">
                  Rings · Chains · Kadas · Earrings
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <Link href="/collections/women" className="group relative block aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[3/4]">
              <PlaceholderImage seed={2} className="transition-transform duration-700 ease-luxe group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <p className="text-xs font-medium uppercase tracking-editorial text-gold-light">
                  For Her
                </p>
                <h3 className="mt-2 font-display text-3xl font-light italic text-cream">Women</h3>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cream/90">
                  Chains · Pendants · Rings · Earrings · Kadas · Bracelets
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
