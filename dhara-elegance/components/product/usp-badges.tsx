import { Droplets, ShieldCheck, Sun } from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, label: "Anti-Tarnish" },
  { icon: Droplets, label: "Waterproof" },
  { icon: Sun, label: "Sweat-Proof" },
];

export function UspBadges() {
  return (
    <div className="flex flex-wrap gap-3">
      {BADGES.map((b) => (
        <span
          key={b.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-xs font-medium text-navy"
        >
          <b.icon className="h-3.5 w-3.5 text-gold" />
          {b.label}
        </span>
      ))}
    </div>
  );
}
