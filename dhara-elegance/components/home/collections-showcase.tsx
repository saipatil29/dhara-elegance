"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { staggerContainer, fadeInUp } from "@/utils/animations";
import { COLLECTIONS } from "@/lib/data/homepage";

export function CollectionsShowcase() {
  return (
    <section className="bg-luxe-surface py-16 sm:py-24">
      <div className="container-luxe px-4">
        <SectionHeading
          eyebrow="Curated Edits"
          title="Signature Collections"
          description="Thoughtfully composed stories of design, for every occasion."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-12 grid gap-6 md:grid-cols-3"
        >
          {COLLECTIONS.map((collection) => (
            <motion.div key={collection.id} variants={fadeInUp}>
              <Link
                href={collection.href}
                className="group relative block aspect-[3/4] overflow-hidden rounded-3xl shadow-sm transition-shadow duration-300 hover:shadow-glass-lg"
              >
                <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                  <PlaceholderImage seed={collection.seed} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-2xl font-semibold text-white">
                    {collection.name}
                  </h3>
                  <p className="mt-2 text-sm text-white/80">
                    {collection.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white transition-transform duration-300 group-hover:translate-x-1">
                    Discover
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
