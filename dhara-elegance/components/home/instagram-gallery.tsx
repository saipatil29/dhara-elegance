"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Instagram } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { staggerContainer, fadeInUp } from "@/utils/animations";
import { INSTAGRAM_POSTS } from "@/lib/data/homepage";
import { SITE_CONFIG as CONFIG } from "@/lib/constants";

export function InstagramGallery() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-luxe px-4">
        <SectionHeading
          eyebrow="@dharaelegance"
          title="Follow Our Journey"
          description="Join our community for styling inspiration and new drops."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6"
        >
          {INSTAGRAM_POSTS.map((post) => (
            <motion.div key={post.id} variants={fadeInUp}>
              <Link
                href={CONFIG.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-xl"
              >
                <div className="h-full w-full transition-transform duration-500 group-hover:scale-110">
                  <PlaceholderImage seed={post.seed} iconClassName="h-6 w-6" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-brand-dark/0 text-white opacity-0 transition-all duration-300 group-hover:bg-brand-dark/60 group-hover:opacity-100">
                  <Heart className="h-4 w-4 fill-white" />
                  <span className="text-xs font-medium">{post.likes}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 flex justify-center">
          <Link
            href={CONFIG.links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium text-brand-primary transition-colors hover:text-brand-accent"
          >
            <Instagram className="h-4 w-4" />
            Follow @dharaelegance
          </Link>
        </div>
      </div>
    </section>
  );
}
