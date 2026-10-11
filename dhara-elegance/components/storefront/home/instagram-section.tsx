import Link from "next/link";
import { Instagram } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { PlaceholderImage } from "@/components/shared/placeholder-image";

/**
 * A link-out promo grid to the real Instagram profile — NOT fake
 * "social proof" post embeds, since no Instagram API integration or
 * real post imagery exists in this build. Six on-brand tiles that
 * all point to the actual profile.
 */
export function InstagramSection() {
  const handle = "@dharaelegance.co";
  const profileUrl = "https://www.instagram.com/dharaelegance.co/";

  return (
    <section className="py-20 sm:py-28">
      <div className="container-editorial px-5">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-xs font-medium uppercase tracking-editorial text-gold">
            Follow Along
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
            {handle}
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Link
              key={i}
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-lg"
            >
              <PlaceholderImage seed={i} iconClassName="h-6 w-6" />
              <div className="absolute inset-0 flex items-center justify-center bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/50">
                <Instagram className="h-5 w-5 text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:border-gold hover:text-gold"
          >
            <Instagram className="h-4 w-4" /> Follow {handle}
          </Link>
        </div>
      </div>
    </section>
  );
}
