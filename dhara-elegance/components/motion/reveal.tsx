"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { fadeUp } from "@/components/motion/variants";
import { cn } from "@/utils/cn";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  /** Render as a different element than div (e.g. "section", "li"). */
  as?: "div" | "section" | "li" | "article";
  once?: boolean;
}

/**
 * Scroll-triggered reveal used throughout the storefront. Respects
 * prefers-reduced-motion by collapsing to a simple opacity fade with
 * no vertical travel, via framer-motion's own useReducedMotion hook.
 */
export function Reveal({
  children,
  className,
  variants = fadeUp,
  delay = 0,
  as = "div",
  once = true,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as];

  const effectiveVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
      }
    : variants;

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      variants={effectiveVariants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Wraps a list of children, staggering each direct child's reveal. */
export function StaggerReveal({
  children,
  className,
  stagger = 0.12,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : stagger,
            delayChildren: prefersReducedMotion ? 0 : 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** A single stagger child — pair with StaggerReveal. */
export function StaggerItem({
  children,
  className,
  variants = fadeUp,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div className={cn(className)} variants={variants}>
      {children}
    </motion.div>
  );
}
