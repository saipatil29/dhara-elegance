"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { SectionHeading } from "@/components/shared/section-heading";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { staggerContainer, fadeInUp } from "@/utils/animations";
import { FEATURED_CATEGORIES } from "@/lib/data/homepage";

export function FeaturedCategories() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-luxe px-4">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Featured Categories"
          description="Explore our curated edit of rings, necklaces, earrings and bracelets — each piece designed to be treasured."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
        >
          {FEATURED_CATEGORIES.map((category) => (
            <motion.div key={category.name} variants={fadeInUp}>
              <Link
                href={category.href}
                className="group relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-sm transition-shadow duration-300 hover:shadow-glass-lg"
              >
                <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                  <PlaceholderImage seed={category.seed} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-lg font-semibold text-white">
                    {category.name}
                  </h3>
                  <span className="text-xs text-white/80 transition-colors group-hover:text-white">
                    Explore →
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
