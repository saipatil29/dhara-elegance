import { Droplets, ShieldCheck, Sparkles, Heart, Sun } from "lucide-react";

import { StaggerReveal, StaggerItem } from "@/components/motion/reveal";

const USPS = [
  { icon: ShieldCheck, label: "Anti-Tarnish", copy: "Built to hold its shine through everyday wear." },
  { icon: Droplets, label: "Waterproof", copy: "Shower, swim, or get caught in the rain — worry-free." },
  { icon: Sun, label: "Sweat-Proof", copy: "Made for real days, not just special occasions." },
  { icon: Heart, label: "Skin-Friendly", copy: "Comfortable for sensitive skin, all day long." },
  { icon: Sparkles, label: "Everyday Wear", copy: "Premium look, designed for daily comfort." },
];

export function UspStrip() {
  return (
    <section className="border-y border-navy/8 bg-cream py-14">
      <div className="container-editorial px-5">
        <StaggerReveal className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {USPS.map((usp) => (
            <StaggerItem key={usp.label} className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy/5">
                <usp.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-navy">{usp.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{usp.copy}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
