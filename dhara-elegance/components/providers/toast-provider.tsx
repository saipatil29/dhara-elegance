"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "rounded-xl border border-navy/10 bg-white shadow-lifted font-body",
          title: "text-navy font-medium",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}
