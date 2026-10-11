import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { SortSelect } from "@/components/product/sort-select";
import { FilterSidebar, MobileFilterDrawer } from "@/components/product/filter-bar";
import { getProducts, type ProductFilters } from "@/services/products";
import { getCategoriesByGender } from "@/services/categories";
import { GENDERS, type Gender } from "@/lib/constants";
import { cn } from "@/utils/cn";

interface CategoryPageProps {
  params: Promise<{ gender: string; category: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

function isGender(value: string): value is Gender {
  return (GENDERS as readonly string[]).includes(value);
}

const PAGE_SIZE = 12;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return { title: label };
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { gender, category } = await params;
  const sp = await searchParams;

  if (!isGender(gender)) notFound();

  const categories = await getCategoriesByGender(gender);
  const currentCategory = categories.find((c) => c.slug === category);
  if (!currentCategory) notFound();

  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const filters: ProductFilters = {
    gender,
    categorySlug: category,
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    isNew: sp.new === "1",
    isBestseller: sp.bestseller === "1",
    sort: (sp.sort as ProductFilters["sort"]) ?? "featured",
    page,
    pageSize: PAGE_SIZE,
  };

  const { items, total } = await getProducts(filters);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams(
      Object.entries(sp).filter(([, v]) => v != null) as [string, string][]
    );
    params.set("page", String(p));
    return `?${params.toString()}`;
  }

  return (
    <main className="bg-cream py-10 sm:py-14">
      <div className="container-editorial px-5">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-navy">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/collections/${gender}`} className="capitalize hover:text-navy">{gender}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-navy">{currentCategory.name}</span>
        </nav>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">
              {currentCategory.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {total} {total === 1 ? "piece" : "pieces"}
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-8">
          <FilterSidebar />

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-between">
              <MobileFilterDrawer />
              <SortSelect />
            </div>

            {items.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                  {items.map((product, i) => (
                    <ProductCard key={product.id} product={product} seed={i} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Link
                        key={i}
                        href={pageHref(i + 1)}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full text-sm",
                          page === i + 1 ? "bg-navy text-cream" : "text-navy hover:bg-navy/5"
                        )}
                      >
                        {i + 1}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-navy/15 p-16 text-center">
                <p className="text-sm text-muted-foreground">
                  No pieces match these filters yet. Try adjusting your filters, or check back
                  soon as new products are added.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
