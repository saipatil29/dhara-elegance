import { Playfair_Display, Inter } from "next/font/google";

/**
 * Display font — premium editorial serif for headlines, product
 * names, and hero copy.
 */
export const displayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

/** Body font — clean modern sans-serif for UI and paragraphs. */
export const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
