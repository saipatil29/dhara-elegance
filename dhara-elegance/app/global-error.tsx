"use client";

/**
 * Catches errors thrown in the root layout itself. Must render its
 * own <html>/<body> since it replaces the entire root layout.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white font-sans">
        <div className="flex flex-col items-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-semibold text-[#2E1065]">
            Dhara Elegance is temporarily unavailable
          </h1>
          <p className="text-sm text-gray-500">
            Please refresh the page, or try again shortly.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-md bg-[#5B21B6] px-6 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
