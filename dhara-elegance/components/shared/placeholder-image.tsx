import { Gem } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * No real product/lifestyle photography exists for this project —
 * only the brand logo was supplied. Per the "never fake data" rule,
 * this renders an honest, on-brand placeholder rather than pointing
 * <Image> at a fabricated URL that would 404 or silently point to
 * stock photography that isn't actually Dhara Elegance's.
 *
 * Swap for real photography by giving product/gallery components a
 * real `src` — everything that uses this component already falls
 * back to it only when no `src` is present.
 */

const NAVY_VARIANTS = [
  "from-navy-900 via-navy-800 to-navy-700",
  "from-navy-950 via-navy-900 to-navy-800",
  "from-navy-800 via-navy-700 to-navy-600",
];

interface PlaceholderImageProps {
  seed?: number;
  label?: string;
  className?: string;
  iconClassName?: string;
}

export function PlaceholderImage({
  seed = 0,
  label,
  className,
  iconClassName,
}: PlaceholderImageProps) {
  const gradient = NAVY_VARIANTS[seed % NAVY_VARIANTS.length];

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br",
        gradient,
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.18),transparent_60%)]" />
      <Gem className={cn("relative h-9 w-9 text-gold-light/70", iconClassName)} strokeWidth={1.1} />
      {label && (
        <span className="absolute bottom-3 left-3 rounded-full bg-navy-950/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-cream/90 backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
}
