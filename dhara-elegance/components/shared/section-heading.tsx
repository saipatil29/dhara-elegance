import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/shared/animated-section";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <AnimatedSection
      className={cn(
        "mx-auto max-w-2xl",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="mb-3 inline-block font-body text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-semibold text-brand-dark sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </AnimatedSection>
  );
}
