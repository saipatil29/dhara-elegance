"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { MouseDepth } from "@/components/motion/parallax";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { fadeUp, fadeIn } from "@/components/motion/variants";

/**
 * Cinematic hero. No real hero photography exists yet — the navy
 * gradient + gold accents below is deliberate brand-consistent
 * staging (matching the logo's own palette) rather than a stock
 * photo standing in for Dhara Elegance product imagery.
 */
export function HeroSection() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-navy-950">
      <div className="absolute inset-0">
        <PlaceholderImage seed={0} className="opacity-60" iconClassName="h-24 w-24" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-950/20" />
      </div>

      <div className="container-editorial relative z-10 px-5">
        <MouseDepth intensity={4} className="max-w-2xl">
          <Reveal variants={fadeIn}>
            <p className="text-xs font-medium uppercase tracking-editorial text-gold-light">
              Anti-Tarnish · Waterproof · Sweat-Proof
            </p>
          </Reveal>

          <Reveal variants={fadeUp} delay={0.1}>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] text-cream sm:text-6xl lg:text-7xl">
              Jewellery that lives with you.
            </h1>
          </Reveal>

          <Reveal variants={fadeUp} delay={0.2}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-cream/80 sm:text-lg">
              Anti-tarnish. Waterproof. Sweat-proof. Made to shine every day.
            </p>
          </Reveal>

          <Reveal variants={fadeUp} delay={0.3}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button size="lg" variant="gold" asChild>
                <Link href="/collections/women">Shop Women</Link>
              </Button>
              <Button size="lg" variant="outline-light" asChild>
                <Link href="/collections/men">Shop Men</Link>
              </Button>
            </div>
          </Reveal>
        </MouseDepth>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-float text-cream/60">
        <ChevronDown className="h-6 w-6" />
      </div>
    </section>
  );
}
