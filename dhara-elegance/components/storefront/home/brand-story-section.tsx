import { Gem, Hammer, Recycle } from "lucide-react";

import { Reveal, StaggerReveal, StaggerItem } from "@/components/motion/reveal";
import { PlaceholderImage } from "@/components/shared/placeholder-image";

const PILLARS = [
  {
    icon: Hammer,
    title: "Considered Craftsmanship",
    copy: "Every piece is finished to a standard that holds up to real, everyday life — not just a photograph.",
  },
  {
    icon: Gem,
    title: "Designed for Comfort",
    copy: "Lightweight construction and rounded finishing mean you forget you're wearing it — in the best way.",
  },
  {
    icon: Recycle,
    title: "Made to Last",
    copy: "Anti-tarnish plating and waterproof construction so today's favourite is next year's, too.",
  },
];

/** Combines "Brand Story", "Why Dhara Elegance", and "Craftsmanship"
 *  from the brief into one editorial section with three pillars. */
export function BrandStorySection() {
  return (
    <section className="bg-navy py-20 text-cream sm:py-28">
      <div className="container-editorial grid gap-12 px-5 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <PlaceholderImage seed={1} iconClassName="h-16 w-16" />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-editorial text-gold-light">
              Our Story
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              Why Dhara Elegance
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/75">
              We started Dhara Elegance to close a gap we kept running into: jewellery
              that looked premium but couldn&apos;t survive a shower, a workout, or a
              humid afternoon. Every piece here is built anti-tarnish, waterproof and
              sweat-proof from the ground up — so it can actually live the life you do.
            </p>
          </Reveal>

          <StaggerReveal className="mt-10 space-y-6">
            {PILLARS.map((pillar) => (
              <StaggerItem key={pillar.title} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15">
                  <pillar.icon className="h-5 w-5 text-gold-light" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-display text-base font-semibold">{pillar.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-cream/70">{pillar.copy}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}
