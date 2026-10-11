"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Global error boundary for the App Router. Must be a Client
 * Component. Catches errors thrown in the segment (and children)
 * that are not otherwise handled.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dhara Elegance] Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-9 w-9" />
      </div>

      <div className="max-w-md space-y-2">
        <h1 className="font-display text-2xl font-semibold text-brand-dark">
          Something went astray
        </h1>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load this page. Our atelier has been notified —
          please try again in a moment.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/70">
            Reference: {error.digest}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={() => reset()}>
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <a href="/">Return home</a>
        </Button>
      </div>
    </div>
  );
}
