export interface MockProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  seed: number;
}

export const BEST_SELLERS: MockProduct[] = [
  {
    id: "bs-1",
    slug: "eternal-bloom-diamond-ring",
    name: "Eternal Bloom Diamond Ring",
    category: "Rings",
    price: 84999,
    compareAtPrice: 99999,
    rating: 4.9,
    reviewCount: 214,
    isBestSeller: true,
    seed: 0,
  },
  {
    id: "bs-2",
    slug: "regal-heritage-necklace",
    name: "Regal Heritage Necklace",
    category: "Necklaces",
    price: 149999,
    rating: 4.8,
    reviewCount: 168,
    isBestSeller: true,
    seed: 1,
  },
  {
    id: "bs-3",
    slug: "whisper-solitaire-earrings",
    name: "Whisper Solitaire Earrings",
    category: "Earrings",
    price: 42999,
    compareAtPrice: 49999,
    rating: 4.9,
    reviewCount: 302,
    isBestSeller: true,
    seed: 2,
  },
  {
    id: "bs-4",
    slug: "infinity-radiance-bangle",
    name: "Infinity Radiance Bangle",
    category: "Bangles",
    price: 67999,
    rating: 4.7,
    reviewCount: 96,
    isBestSeller: true,
    seed: 3,
  },
];

export const NEW_ARRIVALS: MockProduct[] = [
  {
    id: "na-1",
    slug: "moonlit-pearl-pendant",
    name: "Moonlit Pearl Pendant",
    category: "Pendants",
    price: 38999,
    rating: 4.6,
    reviewCount: 12,
    isNew: true,
    seed: 1,
  },
  {
    id: "na-2",
    slug: "velvet-rose-cocktail-ring",
    name: "Velvet Rose Cocktail Ring",
    category: "Rings",
    price: 71999,
    rating: 4.8,
    reviewCount: 8,
    isNew: true,
    seed: 2,
  },
  {
    id: "na-3",
    slug: "stardust-drop-earrings",
    name: "Stardust Drop Earrings",
    category: "Earrings",
    price: 34999,
    rating: 4.7,
    reviewCount: 21,
    isNew: true,
    seed: 3,
  },
  {
    id: "na-4",
    slug: "aurora-tennis-bracelet",
    name: "Aurora Tennis Bracelet",
    category: "Bracelets",
    price: 94999,
    rating: 4.9,
    reviewCount: 5,
    isNew: true,
    seed: 0,
  },
];

export const FEATURED_CATEGORIES = [
  { name: "Rings", href: "/collections/rings", seed: 0 },
  { name: "Necklaces", href: "/collections/necklaces", seed: 1 },
  { name: "Earrings", href: "/collections/earrings", seed: 2 },
  { name: "Bracelets", href: "/collections/bracelets", seed: 3 },
] as const;

export const COLLECTIONS = [
  {
    id: "col-1",
    name: "The Heritage Edit",
    description: "Timeless motifs reimagined for the modern heirloom.",
    href: "/collections/heritage",
    seed: 0,
  },
  {
    id: "col-2",
    name: "Bridal Radiance",
    description: "Statement pieces for your most luminous day.",
    href: "/collections/bridal",
    seed: 1,
  },
  {
    id: "col-3",
    name: "Everyday Luxe",
    description: "Effortless elegance designed for daily wear.",
    href: "/collections/everyday",
    seed: 2,
  },
] as const;

export const TESTIMONIALS = [
  {
    id: "t-1",
    name: "Aanya Mehta",
    location: "Mumbai",
    rating: 5,
    quote:
      "The craftsmanship is beyond anything I expected. My engagement ring gets stopped and admired everywhere I go.",
  },
  {
    id: "t-2",
    name: "Riya Kapoor",
    location: "Ahmedabad",
    rating: 5,
    quote:
      "Dhara Elegance turned my mother's old necklace into a modern piece I'll treasure forever. Impeccable service.",
  },
  {
    id: "t-3",
    name: "Simran Chaudhary",
    location: "Delhi",
    rating: 5,
    quote:
      "From browsing to delivery, everything felt premium. The packaging alone felt like a gift in itself.",
  },
] as const;

export const INSTAGRAM_POSTS = Array.from({ length: 6 }).map((_, i) => ({
  id: `ig-${i + 1}`,
  seed: i,
  likes: 200 + i * 47,
}));
