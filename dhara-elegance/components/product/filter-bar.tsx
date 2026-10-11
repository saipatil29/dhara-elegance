"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function FilterFields() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = React.useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = React.useState(searchParams.get("max") ?? "");
  const isNew = searchParams.get("new") === "1";
  const isBestseller = searchParams.get("bestseller") === "1";

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyPriceRange() {
    const params = new URLSearchParams(searchParams.toString());
    minPrice ? params.set("min", minPrice) : params.delete("min");
    maxPrice ? params.set("max", maxPrice) : params.delete("max");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-semibold text-navy">Availability</p>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 text-sm text-navy/80">
            <Checkbox checked={isNew} onCheckedChange={(c) => updateParam("new", c ? "1" : null)} />
            New Arrivals
          </label>
          <label className="flex items-center gap-2.5 text-sm text-navy/80">
            <Checkbox
              checked={isBestseller}
              onCheckedChange={(c) => updateParam("bestseller", c ? "1" : null)}
            />
            Best Sellers
          </label>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-navy">Price (₹)</p>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor="min-price" className="sr-only">Min price</Label>
            <Input
              id="min-price"
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={applyPriceRange}
            />
          </div>
          <span className="text-navy/40">–</span>
          <div className="flex-1">
            <Label htmlFor="max-price" className="sr-only">Max price</Label>
            <Input
              id="max-price"
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={applyPriceRange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FilterSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <p className="mb-5 font-display text-lg font-semibold text-navy">Filters</p>
      <FilterFields />
    </aside>
  );
}

export function MobileFilterDrawer() {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="p-5">
          <FilterFields />
        </div>
      </SheetContent>
    </Sheet>
  );
}
