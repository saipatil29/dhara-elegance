import type { Variants } from "framer-motion";

/**
 * Shared motion language for Dhara Elegance. Every variant here uses
 * the "luxe" easing curve from tailwind.config.ts (cubic-bezier(0.22,
 * 1, 0.36, 1)) so movement reads as considered rather than bouncy.
 */

const luxeEase = [0.22, 1, 0.36, 1] as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: luxeEase } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: luxeEase } },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: luxeEase } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: luxeEase } },
};

/** Image reveal: a clipped mask sliding away rather than a fade. */
export const imageReveal: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)" },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.9, ease: luxeEase },
  },
};

export const staggerContainer = (stagger = 0.12, delay = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: luxeEase } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } },
};

export const drawerFromRight: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { duration: 0.4, ease: luxeEase } },
  exit: { x: "100%", transition: { duration: 0.3, ease: "easeIn" } },
};

export const drawerFromBottom: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: { duration: 0.4, ease: luxeEase } },
  exit: { y: "100%", transition: { duration: 0.3, ease: "easeIn" } },
};

export const modalSpring: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 340, damping: 28 },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};
