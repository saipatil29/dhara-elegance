import Link from "next/link";
import { Gem } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-display text-xl font-semibold tracking-tight",
        className
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-white shadow-luxe">
        <Gem className="h-4.5 w-4.5" />
      </span>
      <span className="text-gradient-brand">Dhara Elegance</span>
    </Link>
  );
}
