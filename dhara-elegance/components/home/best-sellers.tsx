"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { staggerContainer, fadeInUp } from "@/utils/animations";
import { BEST_SELLERS } from "@/lib/data/homepage";

export function BestSellers() {
  return (
    <section className="bg-white/50 py-16 sm:py-24">
      <div className="container-luxe px-4">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <SectionHeading
            eyebrow="Loved by Many"
            title="Best Sellers"
            description="The pieces our customers can't stop wearing."
            align="left"
            className="mx-0 max-w-lg text-left"
          />
          <Button variant="outline" asChild className="shrink-0">
            <Link href="/collections/best-sellers">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
        >
          {BEST_SELLERS.map((product) => (
            <motion.div key={product.id} variants={fadeInUp}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
