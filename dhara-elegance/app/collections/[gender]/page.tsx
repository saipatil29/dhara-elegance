import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/motion/reveal";
import { getCategoriesByGender } from "@/services/categories";
import { GENDERS, type Gender } from "@/lib/constants";

interface GenderPageProps {
  params: Promise<{ gender: string }>;
}

function isGender(value: string): value is Gender {
  return (GENDERS as readonly string[]).includes(value);
}

export async function generateMetadata({ params }: GenderPageProps): Promise<Metadata> {
  const { gender } = await params;
  return { title: isGender(gender) ? `${gender[0].toUpperCase()}${gender.slice(1)}` : "Collections" };
}

export const dynamic = "force-dynamic";

export default async function GenderPage({ params }: GenderPageProps) {
  const { gender } = await params;
  if (!isGender(gender)) notFound();

  const categories = await getCategoriesByGender(gender);

  return (
    <main className="bg-cream py-16 sm:py-20">
      <div className="container-editorial px-5">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-xs font-medium uppercase tracking-editorial text-gold">
            {gender === "men" ? "For Him" : "For Her"}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold capitalize text-navy sm:text-5xl">
            {gender}
          </h1>
        </Reveal>

        {categories.length > 0 ? (
          <StaggerReveal className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {categories.map((cat, i) => (
              <StaggerItem key={cat.id}>
                <Link
                  href={`/collections/${gender}/${cat.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-xl"
                >
                  <PlaceholderImage seed={i} />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h2 className="font-display text-lg font-semibold text-cream">{cat.name}</h2>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-cream/80">
                      Explore <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerReveal>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-navy/15 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Categories for {gender} will appear here once added in the admin portal.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
