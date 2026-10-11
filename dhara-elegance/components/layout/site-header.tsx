"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Search, ShoppingBag, User } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { SearchOverlay } from "@/components/storefront/search/search-overlay";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { cn } from "@/utils/cn";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "Men", href: "/collections/men" },
  { label: "Women", href: "/collections/women" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "group relative py-2 text-sm font-medium tracking-wide text-navy/80 transition-colors hover:text-navy",
        isActive && "text-navy"
      )}
    >
      {label}
      <span
        className={cn(
          "absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-300 ease-luxe group-hover:scale-x-100",
          isActive && "scale-x-100"
        )}
      />
    </Link>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 w-full transition-all duration-300",
          scrolled ? "border-b border-navy/10 bg-cream/90 backdrop-blur-md" : "bg-cream/0"
        )}
      >
        <div className="container-editorial flex h-20 items-center justify-between px-5">
          <MobileNav />

          <div className="flex-1 lg:flex-none">
            <Logo variant="badge" size={40} withWordmark className="mx-auto lg:mx-0" />
          </div>

          <nav className="hidden items-center gap-9 lg:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Wishlist" asChild className="relative">
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-navy">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Account" asChild className="hidden sm:inline-flex">
              <Link href="/account">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cart"
              onClick={() => setCartOpen(true)}
              className="relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-navy">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
