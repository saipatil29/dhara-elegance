import Link from "next/link";

import { Logo } from "@/components/layout/logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo variant="badge" size={44} withWordmark href="/" />
        </div>
        <div className="rounded-2xl border border-navy/8 bg-white p-8 shadow-subtle">
          <h1 className="font-display text-2xl font-semibold text-navy">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </main>
  );
}
