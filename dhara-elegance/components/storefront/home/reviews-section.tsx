import { Star } from "lucide-react";

import { Reveal, StaggerReveal, StaggerItem } from "@/components/motion/reveal";
import type { FeaturedReview } from "@/services/reviews";

/**
 * Real approved+featured reviews only. If none exist yet (a brand-
 * new store genuinely has none), this renders an honest empty state
 * rather than fabricated testimonials — per the "never fake data"
 * rule.
 */
export function ReviewsSection({ reviews }: { reviews: FeaturedReview[] }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-editorial px-5">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-xs font-medium uppercase tracking-editorial text-gold">
            Customer Reviews
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
            What They&apos;re Saying
          </h2>
        </Reveal>

        {reviews.length > 0 ? (
          <StaggerReveal className="mt-12 grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <StaggerItem
                key={review.id}
                className="rounded-2xl border border-navy/8 bg-white p-6 shadow-subtle"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < review.rating
                          ? "h-4 w-4 fill-gold text-gold"
                          : "h-4 w-4 text-navy/15"
                      }
                    />
                  ))}
                </div>
                {review.title && (
                  <p className="mt-3 font-display text-base font-semibold text-navy">
                    {review.title}
                  </p>
                )}
                {review.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                )}
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-gold">
                  {review.productName}
                </p>
              </StaggerItem>
            ))}
          </StaggerReveal>
        ) : (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-navy/15 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Be among the first to share your experience with Dhara Elegance.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
