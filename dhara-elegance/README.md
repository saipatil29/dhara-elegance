# Dhara Elegance — Luxury Jewellery E-Commerce

Premium jewellery storefront foundation built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **shadcn/ui**, **Lucide Icons**, **React Hook Form**, and **Zod**.

> **Status:** Phase 1 (foundation) + Phase 2 (homepage) complete. `app/page.tsx` and all homepage sections are built and connected. Other routes (product detail, cart, checkout, account) are still pending.

---

## ✨ Brand

| Token | Value |
|---|---|
| Primary | `#5B21B6` |
| Secondary | `#7E22CE` |
| Accent | `#A855F7` |
| Dark | `#2E1065` |
| Background | White → Lavender gradient |
| Display font | Playfair Display |
| Body font | Poppins |

---

## 📦 Tech Stack

- **Framework:** Next.js 15 (App Router, React Server Components)
- **Language:** TypeScript (strict mode)
- **UI:** React 19 + shadcn/ui (Radix primitives) + Tailwind CSS 3
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod resolvers
- **Backend:** Supabase (`@supabase/ssr` — browser, server, and admin clients)
- **Theming:** next-themes (light/dark, class strategy)
- **Notifications:** Sonner

---

## 📁 Folder Structure

```
dhara-elegance/
├── app/                        # App Router routes & root layout
│   ├── globals.css             # Theme tokens, glassmorphism utilities
│   ├── layout.tsx              # Root layout (fonts, providers, header/footer)
│   ├── page.tsx                 # Homepage — assembles all home sections
│   ├── loading.tsx             # Global loading UI
│   ├── error.tsx                # Global error boundary
│   ├── not-found.tsx           # 404 page
│   └── global-error.tsx        # Root-layout-level crash boundary
│
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   └── dialog.tsx
│   ├── layout/                 # Structural layout components
│   │   ├── site-header.tsx      # Responsive navbar (desktop nav + mobile drawer)
│   │   ├── mobile-nav.tsx        # Dialog-based slide-in mobile menu
│   │   └── site-footer.tsx
│   ├── home/                     # Homepage section components
│   │   ├── hero-section.tsx
│   │   ├── featured-categories.tsx
│   │   ├── best-sellers.tsx
│   │   ├── new-arrivals.tsx
│   │   ├── collections-showcase.tsx
│   │   ├── testimonials.tsx
│   │   ├── instagram-gallery.tsx
│   │   └── newsletter-section.tsx
│   ├── shared/                 # Reusable, brand-specific components
│   │   ├── logo.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── animated-section.tsx
│   │   ├── section-heading.tsx   # Consistent eyebrow/title/description block
│   │   ├── product-card.tsx      # Used by Best Sellers + New Arrivals
│   │   └── placeholder-image.tsx # On-brand gradient placeholder (no external deps)
│   └── providers/               # App-wide context providers
│       ├── providers.tsx
│       ├── theme-provider.tsx
│       └── toast-provider.tsx
│
├── lib/                         # Core app logic
│   ├── utils.ts                 # cn(), formatCurrency, slugify, etc.
│   ├── constants.ts             # Site config, nav links, brand colors
│   ├── validations.ts           # Zod schemas (contact, address, auth, newsletter)
│   ├── fonts.ts                 # next/font Playfair + Poppins config
│   └── data/
│       └── homepage.ts           # Mock data: products, categories, testimonials…
│
├── hooks/                        # Reusable client hooks
│   ├── use-media-query.ts
│   ├── use-scroll-position.ts
│   └── use-local-storage.ts
│
├── types/                        # Global TypeScript types
│   └── index.ts                  # Product, Cart, Order, Address, etc.
│
├── services/                     # Data access / API service layer
│   └── product-service.ts
│
├── supabase/                     # Supabase client factories
│   ├── client.ts                 # Browser client
│   ├── server.ts                 # Server Component client
│   └── admin.ts                  # Service-role client (server-only)
│
├── styles/                       # Reserved for additional stylesheets
│
├── utils/                        # Presentation-layer helpers
│   ├── format.ts                 # Date/rating/discount formatting
│   └── animations.ts             # Shared Framer Motion variants
│
├── public/
│   ├── images/
│   └── fonts/
│
├── middleware.ts                 # Supabase session refresh
├── components.json               # shadcn/ui configuration
├── tailwind.config.ts            # Brand theme, dark mode, animations
├── postcss.config.js
├── next.config.ts
├── tsconfig.json                 # Strict TS + path aliases
├── eslint.config.mjs             # Flat ESLint config (Next 15 / ESLint 9)
├── .prettierrc.json
├── .env.example
├── .env.local                    # (gitignored — copy from .env.example)
├── .gitignore
├── next-env.d.ts
└── package.json
```

---

## 🚀 Installation Guide

### 1. Prerequisites
- Node.js **≥ 18.18** (Node 20 LTS recommended)
- npm, pnpm, or yarn

### 2. Extract the project
Unzip `dhara-elegance.zip` and open a terminal in the resulting folder.

### 3. Install dependencies
```bash
npm install
# or
pnpm install
# or
yarn install
```

### 4. Configure environment variables
```bash
cp .env.example .env.local
```
Then fill in your Supabase project URL/keys (and any payment/email keys) in `.env.local`. The app will run without them, but Supabase-backed features (auth, product data) will no-op until configured.

### 5. Run the dev server
```bash
npm run dev
```
Visit **http://localhost:3000**.

### 6. Other scripts
```bash
npm run build         # Production build
npm run start          # Start production server
npm run lint            # ESLint
npm run lint:fix        # ESLint with autofix
npm run type-check      # TypeScript check (no emit)
npm run format           # Prettier write
npm run format:check     # Prettier check
```

### 7. (Optional) Re-sync shadcn/ui components
This project already includes hand-configured shadcn/ui primitives under `components/ui`. If you want to pull additional official components later:
```bash
npx shadcn@latest add <component-name>
```
It will read `components.json` and match the existing theme automatically.

---

## 🌗 Dark Mode

Dark mode uses `next-themes` with the `class` strategy (see `tailwind.config.ts` → `darkMode: ["class"]` and `components/providers/theme-provider.tsx`). Toggle it with the `ThemeToggle` component in the header, or programmatically via `useTheme()` from `next-themes`.

---

## 🧱 What's Included

### Phase 1 — Foundation
- ✅ Full project configuration (TypeScript, ESLint, Tailwind, PostCSS, shadcn/ui)
- ✅ Path aliases (`@/components`, `@/lib`, `@/hooks`, `@/types`, `@/services`, `@/supabase`, `@/utils`)
- ✅ Luxury purple theme + lavender gradient + glassmorphism utility classes
- ✅ Playfair Display + Poppins fonts wired via `next/font`
- ✅ Dark mode support
- ✅ Reusable UI primitives (Button, Card, Input, Label, Separator, Badge, Skeleton, Dialog)
- ✅ Supabase client/server/admin/middleware setup
- ✅ Zod validation schemas + React Hook Form ready to consume them
- ✅ Global `loading.tsx`, `error.tsx`, `not-found.tsx`, `global-error.tsx`
- ✅ Environment variable scaffolding

### Phase 2 — Homepage
- ✅ `app/page.tsx` assembling all homepage sections
- ✅ **Responsive Navbar** — desktop nav + Dialog-based mobile drawer (`site-header.tsx` + `mobile-nav.tsx`)
- ✅ **Hero Section** — animated headline, stats, dual CTAs, floating product card
- ✅ **Featured Categories** — Rings, Necklaces, Earrings, Bracelets grid
- ✅ **Best Sellers** — reusable `ProductCard` grid with ratings, pricing, discount badges
- ✅ **New Arrivals** — same card system, "New" badges
- ✅ **Collections Showcase** — Heritage / Bridal / Everyday Luxe editorial grid
- ✅ **Testimonials** — glass cards with star ratings
- ✅ **Instagram Gallery** — hover-reveal like counts, linked to brand Instagram
- ✅ **Newsletter** — React Hook Form + Zod validated subscribe form with toast feedback
- ✅ **Footer** — connected from Phase 1
- ✅ Framer Motion scroll-triggered animations throughout (`utils/animations.ts`, `AnimatedSection`)
- ✅ On-brand gradient placeholder images (`PlaceholderImage`) — no external image dependency, swap for real product photos anytime

**Not included yet (Phase 3):** collection/category pages, product detail pages, cart, checkout, account/auth pages, database schema/migrations, real product data, payment integration.

---

## 📄 License
Proprietary — © Dhara Elegance.
