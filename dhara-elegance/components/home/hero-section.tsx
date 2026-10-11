"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { staggerContainer, fadeInUp, scaleIn } from "@/utils/animations";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient glow accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-brand-primary/20 blur-3xl" />

      <div className="container-luxe grid items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-brand-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            New Season Collection — 2026
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-display text-4xl font-bold leading-tight text-brand-dark sm:text-5xl lg:text-6xl"
          >
            Timeless Jewellery,{" "}
            <span className="text-gradient-brand">Modern Elegance</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-6 max-w-lg text-base text-muted-foreground sm:text-lg"
          >
            Handcrafted rings, necklaces, earrings and bracelets designed
            for life&apos;s most cherished moments — where heritage
            craftsmanship meets contemporary design.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Button size="lg" asChild>
              <Link href="/collections">
                Shop Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">Our Story</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-10 flex items-center gap-8"
          >
            <div>
              <p className="font-display text-2xl font-bold text-brand-primary">
                15k+
              </p>
              <p className="text-xs text-muted-foreground">Happy customers</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="font-display text-2xl font-bold text-brand-primary">
                4.9<span className="text-sm">/5</span>
              </p>
              <p className="text-xs text-muted-foreground">Average rating</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="font-display text-2xl font-bold text-brand-primary">
                25+
              </p>
              <p className="text-xs text-muted-foreground">Years of craft</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          className="relative"
        >
          <div className="glass-card relative aspect-[4/5] overflow-hidden rounded-3xl p-3">
            <div className="h-full w-full overflow-hidden rounded-2xl">
              <PlaceholderImage label="Signature Collection" seed={0} />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, x: -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="glass-card absolute -bottom-6 -left-6 hidden w-48 rounded-2xl p-4 sm:block"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-xl">
                <PlaceholderImage seed={2} />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-brand-dark">
                  Eternal Bloom
                </p>
                <p className="text-xs text-brand-primary">₹84,999</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
