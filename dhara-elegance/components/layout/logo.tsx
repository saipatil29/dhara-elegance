import Image from "next/image";
import Link from "next/link";

import { cn } from "@/utils/cn";

/**
 * The real Dhara Elegance mark, in two forms derived from the
 * brand-supplied artwork (public/images/logo/logo-source.jpg):
 *
 *   "badge" — the original navy square with the white "de" mark.
 *             Self-contained; reads well on light surfaces
 *             (cream/white headers, social avatars, favicons).
 *
 *   "mark"  — the same white "de" mark with the navy background
 *             chroma-keyed to transparent, so it can sit directly
 *             on dark surfaces (navy footer, admin sidebar) without
 *             a visible square edge.
 *
 * Both are generated, lossless crops of the single supplied asset —
 * nothing about the mark itself was altered.
 */

const SOURCES = {
  badge: {
    128: "/images/logo/logo-badge-128.png",
    256: "/images/logo/logo-badge-256.png",
    512: "/images/logo/logo-badge-512.png",
  },
  mark: {
    128: "/images/logo/logo-mark-white-128.png",
    256: "/images/logo/logo-mark-white-256.png",
    512: "/images/logo/logo-mark-white-512.png",
  },
} as const;

export interface LogoProps {
  /** "badge" on light backgrounds, "mark" on navy/dark backgrounds. */
  variant?: "badge" | "mark";
  /** Pixel size of the square mark. */
  size?: number;
  /** Show "Dhara Elegance" wordmark next to the icon. */
  withWordmark?: boolean;
  /** Show the tagline under the wordmark (header/hero use). */
  withTagline?: boolean;
  href?: string;
  className?: string;
  priority?: boolean;
}

function pickSource(variant: "badge" | "mark", size: number) {
  const set = SOURCES[variant];
  const target = size <= 128 ? 128 : size <= 256 ? 256 : 512;
  return set[target as keyof typeof set];
}

export function Logo({
  variant = "badge",
  size = 40,
  withWordmark = true,
  withTagline = false,
  href = "/",
  className,
  priority = false,
}: LogoProps) {
  const wordmarkColor = variant === "mark" ? "text-cream" : "text-navy";
  const taglineColor = variant === "mark" ? "text-gold-light" : "text-gold";

  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className="relative shrink-0 overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        <Image
          src={pickSource(variant, size)}
          alt="Dhara Elegance"
          fill
          sizes={`${size}px`}
          className="object-contain"
          priority={priority}
        />
      </span>

      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-lg font-semibold tracking-tight sm:text-xl",
              wordmarkColor
            )}
          >
            Dhara Elegance
          </span>
          {withTagline && (
            <span
              className={cn(
                "mt-1 text-[10px] font-medium uppercase tracking-editorial",
                taglineColor
              )}
            >
              Shine Every Day
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="Dhara Elegance — home" className="inline-flex">
      {content}
    </Link>
  );
}

/** Compact icon-only mark, for tight spaces (mobile header, nav button). */
export function LogoMark({
  variant = "badge",
  size = 36,
  className,
}: Pick<LogoProps, "variant" | "size" | "className">) {
  return (
    <Logo
      variant={variant}
      size={size}
      withWordmark={false}
      className={className}
    />
  );
}
