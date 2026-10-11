"use client";

import { motion, useReducedMotion } from "framer-motion";

import { pageTransition } from "@/components/motion/variants";

/**
 * app/template.tsx re-mounts on every navigation (unlike layout.tsx),
 * which is what makes route-to-route page transitions possible in
 * the App Router without a client-side router hack.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return <>{children}</>;

  return (
    <motion.div initial="hidden" animate="visible" exit="exit" variants={pageTransition}>
      {children}
    </motion.div>
  );
}
