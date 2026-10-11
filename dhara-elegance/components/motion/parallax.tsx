"use client";

import * as React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";

/**
 * Scroll-linked depth layer. Moves slower or faster than native
 * scroll depending on `speed` (negative = moves up as you scroll
 * down, creating a parallax-behind effect). Disabled entirely under
 * prefers-reduced-motion — parallax is exactly the kind of motion
 * that rule exists to suppress.
 */
export function ParallaxLayer({
  children,
  className,
  speed = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  /** -1..1 roughly; 0.3 is a gentle background drift. */
  speed?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -40}%`, `${speed * 40}%`]);

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/**
 * Subtle mouse-follow depth for a hero element — a floating jewel
 * or headline that tilts very slightly toward the cursor. Pure CSS
 * 3D transform (perspective + rotateX/Y), no WebGL, so it costs
 * nothing on mobile where it is disabled outright (no mouse).
 */
export function MouseDepth({
  children,
  className,
  intensity = 8,
}: {
  children: React.ReactNode;
  className?: string;
  /** Max rotation in degrees. */
  intensity?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [transform, setTransform] = React.useState("");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(
      `perspective(1000px) rotateY(${px * intensity}deg) rotateX(${-py * intensity}deg)`
    );
  };

  const handleMouseLeave = () => setTransform("");

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("transition-transform duration-300 ease-out [will-change:transform]", className)}
      style={{ transform }}
    >
      {children}
    </div>
  );
}
