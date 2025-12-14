"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Category = "Apparel" | "Shoes" | "Accessories";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  sizes: string[];
  rating: number; // 0..5
  description: string;
};

type CartItem = {
  productId: string;
  size: string;
  quantity: number;
};

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Classic Tee",
    price: 2800,
    image: "https://picsum.photos/id/102/1200/800",
    category: "Apparel",
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.6,
    description: "Soft cotton tee with a clean cut that pairs with anything.",
  },
  {
    id: "p2",
    name: "Everyday Hoodie",
    price: 6200,
    image:
      "https://picsum.photos/id/100/1200/800",
    category: "Apparel",
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.8,
    description: "Warm midweight hoodie with a smooth finish.",
  },
  {
    id: "p3",
    name: "Runner Sneaker",
    price: 8900,
    image: "https://picsum.photos/id/103/1200/800",
    category: "Shoes",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    rating: 4.4,
    description: "Cushioned support with a breathable knit upper.",
  },
  {
    id: "p4",
    name: "City Crossbody",
    price: 5400,
    image: "https://picsum.photos/id/104/1200/800",
    category: "Accessories",
    sizes: ["OS"],
    rating: 4.2,
    description: "Compact bag that holds the daily basics without bulk.",
  },
  {
    id: "p5",
    name: "Minimal Cap",
    price: 1900,
    image:
      "https://picsum.photos/id/101/1200/800",
    category: "Accessories",
    sizes: ["OS"],
    rating: 4.1,
    description: "Curved brim cap with a low profile fit.",
  },
  {
    id: "p6",
    name: "Court Sneaker",
    price: 9200,
    image: "https://picsum.photos/id/105/1200/800",
    category: "Shoes",
    sizes: ["6", "7", "8", "9", "10", "11"],
    rating: 4.7,
    description: "Clean silhouette with grippy outsole for steady steps.",
  },
  {
    id: "p7",
    name: "Relaxed Chinos",
    price: 4800,
    image: "https://picsum.photos/id/106/1200/800",
    category: "Apparel",
    sizes: ["28", "30", "32", "34", "36"],
    rating: 4.3,
    description: "Stretch fabric and straight fit for all day wear.",
  },
  {
    id: "p8",
    name: "Weekender Tote",
    price: 7600,
    image: "https://picsum.photos/id/107/1200/800",
    category: "Accessories",
    sizes: ["OS"],
    rating: 4.5,
    description: "Roomy carry with inner pockets to keep gear sorted.",
  },
];

type SortKey = "relevance" | "price-asc" | "price-desc" | "rating-desc";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [dark, setDark] = useState(false);

  const [sizePick, setSizePick] = useState<Record<string, string | null>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const categories: Category[] = ["Apparel", "Shoes", "Accessories"];

  const filtered = useMemo(() => {
    let list = PRODUCTS.slice();

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `After search filter. query: "${query}", filtered count: ${list.length}`
      );
    }

    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `After category filter. selectedCategories: ${JSON.stringify(
          selectedCategories
        )}, filtered count: ${list.length}`
      );
    }

    if (selectedSizes.length > 0) {
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `After size filter. selectedSizes: ${JSON.stringify(
          selectedSizes
        )}, filtered count: ${list.length}`
      );
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "relevance":
      default:
        // keep initial order
        break;
    }
    if (process.env.NODE_ENV !== "production") {
      console.log(`After sort. sort: ${sort}, filtered count: ${list.length}`);
    }

    return list;
  }, [query, selectedCategories, selectedSizes, sort]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => {
    const p = PRODUCTS.find((x) => x.id === i.productId);
    return sum + (p ? p.price * i.quantity : 0);
  }, 0);
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `Cart subtotal calculated. cartCount: ${cartCount}, subtotal: ${subtotal}`
    );
  }

  function toggleCategory(c: Category) {
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((x) => x !== size) : [...prev, size]
    );
  }

  function pickSize(productId: string, size: string) {
    setSizePick((prev) => ({ ...prev, [productId]: prev[productId] === size ? null : size }));
  }

  function addToCart(product: Product) {
    const chosenSize = sizePick[product.id];
    if (!chosenSize) return;

    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.id && i.size === chosenSize);
      let next: CartItem[];
      if (idx >= 0) {
        next = prev.slice();
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
      } else {
        next = [...prev, { productId: product.id, size: chosenSize, quantity: 1 }];
      }
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `Add to cart called. productId: ${product.id}, chosenSize: ${chosenSize}, cart(next): ${JSON.stringify(
            next
          )}`
        );
      }
      return next;
    });
    setCartOpen(true);
  }

  function changeQty(productId: string, size: string, delta: number) {
    setCart((prev) => {
      const next = prev
        .map((i) =>
          i.productId === productId && i.size === size
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0);
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `changeQty called. productId: ${productId}, size: ${size}, delta: ${delta}, cart: ${JSON.stringify(
            next
          )}`
        );
      }
      return next;
    });
  }

  function removeItem(productId: string, size: string) {
    setCart((prev) => {
      const next = prev.filter((i) => !(i.productId === productId && i.size === size));
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `Remove item called. productId: ${productId}, size: ${size}, cart(next): ${JSON.stringify(
            next
          )}`
        );
      }
      return next;
    });
  }

  function clearCart() {
    setCart([]);
    if (process.env.NODE_ENV !== "production") {
      console.log(`clearCart called. cart should now be empty.`);
    }
  }

  function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // mock submit, no backend calls here
    clearCart();
    setCheckoutOpen(false);
    setOrderPlaced(true);
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `placeOrder called. Cart cleared, checkout closed, orderPlaced: true`
      );
    }
    const timer = setTimeout(() => setOrderPlaced(false), 2600);
    // simple cleanup guard if user navigates, not strictly needed
    return () => clearTimeout(timer);
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        {/* top aura */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(700px_200px_at_50%_-80px,rgba(99,102,241,0.25),transparent)]"
        />
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 grid place-items-center text-white font-bold">
                S
              </div>
              <span className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                SUNNY
              </span>
            </div>

            <div className="ml-6 hidden md:flex flex-1">
              <div className="relative w-full">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, colors, sizes..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 px-4 py-2.5 pl-10 text-sm outline-none ring-0 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => {
                  setDark((d) => !d);
                }}
                aria-label="Toggle theme"
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                title="Toggle theme"
              >
                {dark ? "☀️" : "🌙"}
              </button>

              <button
                onClick={() => {
                  setCartOpen(true);
                  if (process.env.NODE_ENV !== "production") {
                    console.log(
                      `Cart button clicked. cartOpen: ${true}, cartCount: ${cartCount}`
                    );
                  }
                }}
                className="relative rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 text-sm font-medium hover:opacity-90 transition"
                aria-label="Open cart"
              >
                Cart
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 pt-10 sm:pt-14">
          <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  Clean store for everyday picks
                </h1>
                <p className="mt-3 text-slate-600 dark:text-slate-300">
                  Simple styles, steady quality and fair prices. Shop the picks that carry you through the week.
                </p>

                <div className="mt-5 flex gap-3">
                  <a
                    href="#products"
                    className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-white text-sm font-medium hover:bg-indigo-500 transition"
                  >
                    Shop now
                  </a>
                  <button
                    onClick={() => {
                      // quick preset filters, light touch
                      setSelectedCategories(["Apparel", "Shoes"]);
                      setSort("rating-desc");
                    }}
                    className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Best rated
                  </button>
                </div>
              </div>

              <div className="relative h-56 sm:h-72 md:h-64">
                <Image
                  src="https://picsum.photos/seed/sunny-hero/1400/900"
                  alt="Featured collection"
                  fill
                  priority
                  unoptimized
                  className="rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mx-auto max-w-7xl px-6 mt-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="flex items-center gap-2 overflow-x-auto">
              {categories.map((c) => {
                const active = selectedCategories.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCategory(c)}
                    className={`whitespace-nowrap rounded-xl border px-3 py-2 text-sm transition ${
                      active
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                    aria-pressed={active}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <span className="text-sm text-slate-500 dark:text-slate-400">Sort</span>
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 transition"
                aria-label="Sort products"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price low to high</option>
                <option value="price-desc">Price high to low</option>
                <option value="rating-desc">Rating</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "6", "7", "8", "9", "10", "11", "12", "OS"].map(
              (s) => {
                const active = selectedSizes.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSize(s)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                    aria-pressed={active}
                  >
                    {s}
                  </button>
                );
              }
            )}
            {(selectedCategories.length > 0 || selectedSizes.length > 0 || query) && (
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedSizes([]);
                  setQuery("");
                  setSort("relevance");
                }}
                className="ml-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline underline-offset-4"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Product grid */}
        <section id="products" className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => {
              const chosen = sizePick[p.id] ?? null;
              return (
                <article
                  key={p.id}
                  className="group rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="relative h-52">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 dark:bg-slate-900/80 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                      {p.category}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {p.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(p.price)}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Stars rating={p.rating} />
                        <span>{p.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.sizes.map((s) => {
                        const active = chosen === s;
                        return (
                          <button
                            key={s}
                            onClick={() => pickSize(p.id, s)}
                            className={`rounded-lg border px-2 py-1 text-xs transition ${
                              active
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white"
                                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                            aria-pressed={active}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => addToCart(p)}
                      disabled={!chosen}
                      className="mt-4 w-full rounded-xl bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed transition"
                    >
                      {chosen ? "Add to cart" : "Pick a size"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="mt-16 text-center text-slate-600 dark:text-slate-300">
              No products match your filters.
            </div>
          )}
        </section>

        {/* Payments accepted */}
        <section className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                We accept
              </h4>
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Visa */}
                <div aria-label="Visa" className="h-8 w-14 rounded-md bg-[#1A1F71] grid place-items-center">
                  <span className="text-white text-[11px] font-extrabold tracking-wide">VISA</span>
                </div>
                {/* Mastercard */}
                <div aria-label="Mastercard" className="relative h-8 w-14 rounded-md bg-white dark:bg-slate-100 grid place-items-center border border-slate-200">
                  <div className="relative h-5 w-8">
                    <span className="absolute left-[2px] top-1/2 -translate-y-1/2 inline-block h-5 w-5 rounded-full bg-[#EB001B]" />
                    <span className="absolute right-[2px] top-1/2 -translate-y-1/2 inline-block h-5 w-5 rounded-full bg-[#F79E1B] mix-blend-multiply" />
                  </div>
                </div>
                {/* American Express */}
                <div aria-label="American Express" className="h-8 w-14 rounded-md bg-[#2E77BC] grid place-items-center">
                  <span className="text-white text-[10px] font-extrabold tracking-wide">AMEX</span>
                </div>
                {/* Discover */}
                <div aria-label="Discover" className="relative h-8 w-16 rounded-md bg-white dark:bg-slate-100 grid place-items-center border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-900">DISCOVER</span>
                  <span className="absolute right-1 h-4 w-4 rounded-full bg-[#FF6000]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Store info and policies */}
        <section aria-labelledby="store-info" className="mx-auto max-w-7xl px-6 py-8">
          <h2 id="store-info" className="sr-only">Store information</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Merchant</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                DBA: SUNNY
              </p>
            </div>
            <div id="contact" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Customer service</h3>
              <address className="mt-2 not-italic text-sm text-slate-600 dark:text-slate-300" suppressHydrationWarning>
                <div>123 Market St, San Francisco, CA 94105</div>
                <div>Phone: (555) 123-4567</div>
                <div>
                  Email:{" "}
                  <a href="mailto:support@sunny.store" className="underline underline-offset-4 hover:text-slate-800 dark:hover:text-slate-100">
                    support@sunny.store
                  </a>
                </div>
              </address>
            </div>
            <div id="shipping" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Shipping</h3>
              <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
                <li>Standard 3-5 business days, free over $50 otherwise $5</li>
                <li>Expedited 2 business days, $12</li>
                <li>Overnight 1 business day, $25</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div id="return-policy" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Return and refund policy</h3>
              <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
                <li>Returns accepted within 30 days in new condition with tags.</li>
                <li>Refunds go to the original payment method within 5-10 business days after receipt.</li>
                <li>Final sale items are not eligible. Return shipping is $6, waived on defects.</li>
              </ul>
            </div>
            <div id="privacy-policy" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Privacy policy</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                We use order info to fulfill purchases, prevent fraud and provide support. We do not sell personal data. To request data removal or access, email support@sunny.store.
              </p>
            </div>
          </div>
        </section>

        {/* Cart drawer */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-full max-w-md transform bg-white dark:bg-slate-900 shadow-2xl transition-transform ${
            cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-hidden={!cartOpen}
          aria-label="Cart drawer"
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Your cart
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                aria-label="Close cart"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-4">
              {cart.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">Your cart is empty.</p>
              ) : (
                <ul className="space-y-4">
                  {cart.map((item) => {
                    const p = PRODUCTS.find((x) => x.id === item.productId)!;
                    return (
                      <li key={`${item.productId}-${item.size}`} className="flex gap-3">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                          <Image src={p.image} alt={p.name} fill unoptimized className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {p.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                Size: {item.size} · {p.category}
                              </div>
                            </div>
                            <div className="text-sm font-semibold">
                              {formatCurrency(p.price * item.quantity)}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                              <button
                                onClick={() => changeQty(item.productId, item.size, -1)}
                                className="px-2 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                              <button
                                onClick={() => changeQty(item.productId, item.size, +1)}
                                className="px-2 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId, item.size)}
                              className="text-sm text-slate-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Subtotal</span>
                <span className="text-base font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <button
                onClick={() => {
                  setCheckoutOpen(true);
                  if (process.env.NODE_ENV !== "production") {
                    console.log(
                      `Checkout button clicked. checkoutOpen: ${true}, cart: ${JSON.stringify(
                        cart
                      )}`
                    );
                  }
                }}
                disabled={cart.length === 0}
                className="mt-3 w-full rounded-xl bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-500 transition"
              >
                Check out
              </button>
            </div>
          </div>
        </aside>

        {/* Cart overlay */}
        {cartOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setCartOpen(false)}
          />
        )}

        {/* Checkout modal */}
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setCheckoutOpen(false)}
            />
            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Delivery details
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Fill your info. This is a demo, no payment is processed.
              </p>
              <form className="mt-4 space-y-3" onSubmit={placeOrder}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-500">Full name</label>
                    <input
                      required
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Email</label>
                    <input
                      type="email"
                      required
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-500">Phone</label>
                    <input
                      type="tel"
                      required
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Postal code</label>
                    <input
                      required
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Address</label>
                  <input
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-500">City</label>
                    <input
                      required
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">State</label>
                    <input
                      required
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-500"
                  >
                    Place order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        {orderPlaced && (
          <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
            <div className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm shadow-lg">
              Order placed. You will get a confirmation by email.
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © <span suppressHydrationWarning>{new Date().getFullYear()}</span> SUNNY. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <a className="hover:text-slate-800 dark:hover:text-slate-200" href="#return-policy">
                Returns
              </a>
              <a className="hover:text-slate-800 dark:hover:text-slate-200" href="#privacy-policy">
                Privacy
              </a>
              <a className="hover:text-slate-800 dark:hover:text-slate-200" href="#contact">
                Contact
              </a>
              <a className="hover:text-slate-800 dark:hover:text-slate-200" href="#shipping">
                Shipping
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < full) return "full";
    if (i === full && half) return "half";
    return "empty";
  });
  return (
    <span className="inline-flex items-center">
      {stars.map((s, i) => {
        if (s === "full") {
          return (
            <svg key={i} className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.948 5.956 6.563.954-4.756 4.635 1.122 6.545z" />
            </svg>
          );
        }
        if (s === "half") {
          return (
            <svg key={i} className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 20 20" aria-hidden>
              <defs>
                <linearGradient id={`half-${i}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.948 5.956 6.563.954-4.756 4.635 1.122 6.545z"
                fill={`url(#half-${i})`}
                stroke="currentColor"
                strokeWidth="0.6"
              />
            </svg>
          );
        }
        return (
          <svg key={i} className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.948 5.956 6.563.954-4.756 4.635 1.122 6.545z" />
          </svg>
        );
      })}
    </span>
  );
}
