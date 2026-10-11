"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";

import { fadeInUp } from "@/utils/animations";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
}

/**
 * Fades and slides content into view once as the user scrolls to it.
 * Wrap any section on the page with this for consistent motion.
 */
export function AnimatedSection({
  children,
  className,
  variants = fadeInUp,
  delay = 0,
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
