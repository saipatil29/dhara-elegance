import Link from "next/link";

import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo size={56} withWordmark={false} />
      <div className="space-y-2">
        <p className="font-display text-6xl font-bold text-navy">404</p>
        <h1 className="font-display text-2xl font-semibold text-navy">
          This piece isn&apos;t in the collection
        </h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for may have moved.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-full bg-navy px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-gold hover:text-navy"
      >
        Return home
      </Link>
    </div>
  );
}
