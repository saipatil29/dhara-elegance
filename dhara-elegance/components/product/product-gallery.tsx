"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/utils/cn";

interface GalleryImage {
  url: string;
  altText: string | null;
}

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [active, setActive] = React.useState(0);
  const [fullscreen, setFullscreen] = React.useState(false);

  const hasImages = images.length > 0;
  const current = hasImages ? images[active] : null;

  const next = React.useCallback(
    () => setActive((i) => (i + 1) % Math.max(images.length, 1)),
    [images.length]
  );
  const prev = React.useCallback(
    () => setActive((i) => (i - 1 + images.length) % Math.max(images.length, 1)),
    [images.length]
  );

  React.useEffect(() => {
    if (!fullscreen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") setFullscreen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, next, prev]);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            {current ? (
              <Image
                src={current.url}
                alt={current.altText ?? productName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <PlaceholderImage seed={0} iconClassName="h-16 w-16" />
            )}
          </motion.div>
        </AnimatePresence>

        {hasImages && (
          <button
            onClick={() => setFullscreen(true)}
            aria-label="View full screen"
            className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy shadow-subtle transition-transform hover:scale-105"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy shadow-subtle"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy shadow-subtle"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === active ? "border-gold" : "border-transparent"
              )}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-4xl border-0 bg-navy-950/95 p-6 shadow-none">
          <DialogTitle className="sr-only">{productName} — full screen</DialogTitle>
          <div className="relative aspect-square w-full">
            {current && (
              <Image
                src={current.url}
                alt={current.altText ?? productName}
                fill
                sizes="90vw"
                className="rounded-xl object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
