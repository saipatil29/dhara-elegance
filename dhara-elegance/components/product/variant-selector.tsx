"use client";

import { cn } from "@/utils/cn";

export interface VariantOption {
  id: string;
  value: string;
  stock: number;
}

export function VariantSelector({
  label,
  options,
  selectedId,
  onSelect,
}: {
  label: string;
  options: VariantOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-navy">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const outOfStock = opt.stock <= 0;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={outOfStock}
              onClick={() => onSelect(opt.id)}
              className={cn(
                "min-w-11 rounded-full border px-4 py-2 text-sm transition-colors",
                selectedId === opt.id
                  ? "border-navy bg-navy text-cream"
                  : "border-navy/20 text-navy hover:border-navy",
                outOfStock && "cursor-not-allowed opacity-40 line-through"
              )}
            >
              {opt.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
