"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { staggerContainer, fadeInUp } from "@/utils/animations";
import { TESTIMONIALS } from "@/lib/data/homepage";

export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-luxe px-4">
        <SectionHeading
          eyebrow="Testimonials"
          title="What Our Customers Say"
          description="Real stories from those who wear Dhara Elegance."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-12 grid gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map((testimonial) => (
            <motion.div key={testimonial.id} variants={fadeInUp}>
              <Card glass className="h-full">
                <CardContent className="flex h-full flex-col p-6">
                  <Quote className="h-8 w-8 text-brand-accent/50" />
                  <p className="mt-4 flex-1 font-body text-sm leading-relaxed text-foreground/90">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  <div className="mt-6 flex items-center gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-brand-gold text-brand-gold"
                      />
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient font-display text-sm font-semibold text-white">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-brand-dark">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
