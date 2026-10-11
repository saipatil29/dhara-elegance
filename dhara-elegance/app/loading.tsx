import { LogoMark } from "@/components/layout/logo";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="animate-pulse">
        <LogoMark size={56} />
      </div>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
        <div className="skeleton-shimmer h-full w-full" />
      </div>
    </div>
  );
}
