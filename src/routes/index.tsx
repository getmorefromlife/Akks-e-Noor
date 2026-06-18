import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Toaster } from "sonner";
import { usePosters, type Poster } from "@/lib/posters";
import { FilterPanel, emptyFilters, type Filters } from "@/components/FilterPanel";
import { PosterCard } from "@/components/PosterCard";
import { PosterModal } from "@/components/PosterModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mahfil — A Poster Archive" },
      { name: "description", content: "A curated archive of devotional posters honoring the 14 Masoomeen, organized by theme, calendar, and occasion." },
      { property: "og:title", content: "Mahfil — A Poster Archive" },
      { property: "og:description", content: "A curated archive of devotional posters." },
    ],
  }),
  component: Index,
});

function matches(p: Poster, q: string, f: Filters) {
  if (q) {
    const s = q.toLowerCase();
    if (!p.title.toLowerCase().includes(s) && !p.description.toLowerCase().includes(s)) return false;
  }
  if (f.themes.length && !f.themes.some((x) => p.themes.includes(x))) return false;
  if (f.calendarMonths.length && !f.calendarMonths.some((x) => p.calendarMonths.includes(x))) return false;
  if (f.islamicMonths.length && !f.islamicMonths.some((x) => p.islamicMonths.includes(x))) return false;
  if (f.masoomeen.length && !f.masoomeen.some((x) => p.masoomeen.includes(x))) return false;
  if (f.occasions.length && !f.occasions.some((x) => p.occasions.includes(x))) return false;
  return true;
}

function Index() {
  const { posters, ready } = usePosters();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [open, setOpen] = useState<Poster | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(
    () => posters.filter((p) => matches(p, query, filters)),
    [posters, query, filters]
  );

  // Deep-link from share URL
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("poster");
    if (id) {
      const found = posters.find((p) => p.id === id);
      if (found) setOpen(found);
    }
  }, [ready, posters]);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="bottom-center" />

      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-6 py-4">
          <Link to="/" className="font-serif text-2xl tracking-tight">
            Mahfil<span className="text-accent">.</span>
          </Link>
          <div className="relative ml-4 hidden flex-1 max-w-xl md:block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles and stories…"
              className="w-full rounded-full border border-border bg-secondary/40 py-2.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-foreground focus:bg-background"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setMobileFilters(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <Link
              to="/admin"
              className="rounded-full border border-foreground/80 px-4 py-2 text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Admin
            </Link>
          </div>
        </div>
        <div className="px-6 pb-4 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-full border border-border bg-secondary/40 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-foreground"
            />
          </div>
        </div>
      </header>

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-[1600px] px-6 py-16 md:py-24">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">A Poster Archive</p>
          <h1 className="mt-3 font-serif text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Light, ink, and remembrance.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            A quiet gallery of posters honoring the Fourteen Infallibles —
            organized by theme, by month, and by the occasions that gather us together.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1600px] gap-10 px-6 py-12 md:grid-cols-[280px_1fr]">
        <div className="hidden md:block">
          <div className="sticky top-24">
            <FilterPanel filters={filters} setFilters={setFilters} />
          </div>
        </div>

        <main>
          <div className="mb-6 flex items-baseline justify-between">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "poster" : "posters"}
            </p>
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-20 text-center">
              <p className="font-serif text-2xl">Nothing found</p>
              <p className="mt-2 text-sm text-muted-foreground">Try removing a filter or clearing your search.</p>
            </div>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {filtered.map((p) => (
                <PosterCard key={p.id} poster={p} onOpen={setOpen} />
              ))}
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-border/60 py-10 text-center text-xs uppercase tracking-widest text-muted-foreground">
        Made with quiet care · Mahfil Archive
      </footer>

      <PosterModal poster={open} onClose={() => setOpen(null)} />

      {mobileFilters && (
        <div className="fixed inset-0 z-40 bg-background md:hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="font-serif text-xl">Filters</span>
            <button onClick={() => setMobileFilters(false)} aria-label="Close filters">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-6 pb-20" style={{ maxHeight: "calc(100vh - 60px)" }}>
            <FilterPanel filters={filters} setFilters={setFilters} />
          </div>
        </div>
      )}
    </div>
  );
}
