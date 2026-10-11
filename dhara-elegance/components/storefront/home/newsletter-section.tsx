"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/reveal";
import { newsletterSchema, type NewsletterValues } from "@/lib/validations/common";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export function NewsletterSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: NewsletterValues) {
    const result = await subscribeToNewsletter(values);
    if (result.success) {
      toast.success("You're on the list!", { description: "Watch your inbox for new arrivals." });
      reset();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <section className="py-20 sm:py-24">
      <div className="container-editorial px-5">
        <Reveal className="mx-auto max-w-xl overflow-hidden rounded-3xl bg-navy px-8 py-14 text-center text-cream sm:px-14">
          <p className="text-xs font-medium uppercase tracking-editorial text-gold-light">
            Stay Connected
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
            Be First to Know
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-cream/75">
            New collections, early access, and styling ideas — straight to your inbox.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1 text-left">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/50" />
              <Input
                type="email"
                placeholder="Your email"
                aria-invalid={!!errors.email}
                className="h-12 border-0 bg-cream pl-11 text-navy"
                {...register("email")}
              />
            </div>
            <Button type="submit" variant="gold" disabled={isSubmitting} className="h-12 shrink-0">
              {isSubmitting ? "Joining…" : "Subscribe"}
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {errors.email && (
            <p className="mt-2 text-xs text-gold-light">{errors.email.message}</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
