"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X, Loader2, TrendingUp, Clock } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { searchProducts, type SearchResult } from "@/services/search";
import { formatCurrency } from "@/utils/format";

const POPULAR_SEARCHES = ["Rings", "Chains", "Kadas", "Anti-tarnish", "Bracelets"];
const RECENT_KEY = "dhara-elegance-recent-searches";

export function SearchOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { value: recent, setValue: setRecent } = useLocalStorage<string[]>(RECENT_KEY, []);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    const handle = setTimeout(async () => {
      const r = await searchProducts(query);
      setResults(r);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  function commitSearch(term: string) {
    if (!term.trim()) return;
    setRecent((prev) => [term, ...prev.filter((t) => t !== term)].slice(0, 6));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[10%] max-w-2xl translate-y-0 gap-0 p-0">
        <DialogTitle className="sr-only">Search products</DialogTitle>

        <div className="flex items-center gap-3 border-b border-navy/10 p-4">
          <Search className="h-5 w-5 shrink-0 text-navy/50" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitSearch(query);
            }}
            placeholder="Search rings, chains, kadas…"
            className="h-auto border-0 p-0 text-base shadow-none focus-visible:ring-0"
          />
          {isLoading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-navy/40" />}
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close search"
            className="shrink-0 rounded-full p-1 text-navy/50 hover:bg-navy/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim().length >= 2 ? (
            results.length > 0 ? (
              <ul className="space-y-1">
                {results.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/products/${r.slug}`}
                      onClick={() => {
                        commitSearch(query);
                        onOpenChange(false);
                      }}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-cream"
                    >
                      <span className="text-sm text-navy">{r.name}</span>
                      <span className="text-sm font-medium text-gold">
                        {formatCurrency(r.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : !isLoading ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;. Try a category like &ldquo;rings&rdquo; or
                &ldquo;chains&rdquo;.
              </p>
            ) : null
          ) : (
            <div className="space-y-6">
              {recent.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Recent
                  </p>
                  <div className="flex flex-wrap gap-2 px-3">
                    {recent.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="rounded-full border border-navy/15 px-3 py-1.5 text-xs text-navy hover:border-gold"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="mb-2 flex items-center gap-1.5 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" /> Popular
                </p>
                <div className="flex flex-wrap gap-2 px-3">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-navy/15 px-3 py-1.5 text-xs text-navy hover:border-gold"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
