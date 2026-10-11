import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "Collections" };

export default function CollectionsPage() {
  return (
    <main className="bg-cream py-16 sm:py-20">
      <div className="container-editorial px-5">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-xs font-medium uppercase tracking-editorial text-gold">
            Dhara Elegance
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-navy sm:text-5xl">
            Our Collections
          </h1>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {(["men", "women"] as const).map((gender, i) => (
            <Reveal key={gender} delay={i * 0.1}>
              <Link
                href={`/collections/${gender}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[3/4]"
              >
                <PlaceholderImage seed={i + 1} />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <h2 className="font-display text-3xl font-bold capitalize text-cream">{gender}</h2>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm text-cream/90">
                    Shop the collection
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
