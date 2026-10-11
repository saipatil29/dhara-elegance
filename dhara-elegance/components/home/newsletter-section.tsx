"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeInUp } from "@/utils/animations";
import { newsletterSchema, type NewsletterValues } from "@/lib/validations";

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
    // Placeholder submit handler — wire up to a real subscribe
    // endpoint (e.g. an API route or Supabase table) in Phase 2.
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success("You're on the list!", {
      description: `We'll send our latest pieces to ${values.email}.`,
    });
    reset();
  }

  return (
    <section className="py-16 sm:py-24">
      <div className="container-luxe px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
          className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-14 text-center shadow-glass-lg sm:px-12"
        >
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Join the Inner Circle
          </span>

          <h2 className="mt-5 font-display text-3xl font-semibold text-white sm:text-4xl">
            Be the First to Know
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/85 sm:text-base">
            Subscribe for early access to new collections, exclusive offers,
            and styling inspiration — straight to your inbox.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1 text-left">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-primary/70" />
              <Input
                type="email"
                placeholder="Enter your email"
                aria-label="Email address"
                className="h-12 border-0 bg-white pl-11 text-brand-dark placeholder:text-muted-foreground"
                {...register("email")}
              />
              {errors.email && (
                <p className="absolute -bottom-5 left-1 text-xs text-white/90">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              variant="glass"
              disabled={isSubmitting}
              className="h-12 shrink-0 bg-white text-brand-primary hover:bg-white/90"
            >
              {isSubmitting ? "Subscribing…" : "Subscribe"}
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
