import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, LayoutGrid, List, Download, Calendar } from "lucide-react";
import { Toaster, toast } from "sonner";
import { usePosters, type Poster, sortPosters, type SortOrder, downloadPoster, MASOOMEEN } from "@/lib/posters";
import { FilterPanel, emptyFilters, type Filters } from "@/components/FilterPanel";
import { PosterCard } from "@/components/PosterCard";
import { PosterModal } from "@/components/PosterModal";
import { ProgressiveImage } from "@/components/ProgressiveImage";

const MASOOMEEN_SHORT: Record<string, { name: string; ar: string }> = {
  "Prophet Muhammad (s)": { name: "Muhammad", ar: "محمد" },
  "Imam Ali (a)": { name: "Ali", ar: "عـلي" },
  "Lady Fatima (a)": { name: "Fatima", ar: "فاطمة" },
  "Imam Hasan (a)": { name: "Hasan", ar: "حسـن" },
  "Imam Husayn (a)": { name: "Husayn", ar: "حسين" },
  "Imam Ali Zayn al-Abidin (a)": { name: "Sajjad", ar: "سجاد" },
  "Imam Muhammad al-Baqir (a)": { name: "Baqir", ar: "باقر" },
  "Imam Ja'far al-Sadiq (a)": { name: "Sadiq", ar: "صادق" },
  "Imam Musa al-Kadhim (a)": { name: "Kadhim", ar: "كاظم" },
  "Imam Ali al-Rida (a)": { name: "Rida", ar: "رضا" },
  "Imam Muhammad al-Jawad (a)": { name: "Jawad", ar: "جواد" },
  "Imam Ali al-Hadi (a)": { name: "Hadi", ar: "هادي" },
  "Imam Hasan al-Askari (a)": { name: "Askari", ar: "عسكري" },
  "Imam al-Mahdi (aj)": { name: "Mahdi", ar: "مهدي" },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Akks-e-Noor — A Poster Archive" },
      { name: "description", content: "A curated archive of devotional posters honoring the 14 Masoomeen, organized by theme, calendar, and occasion." },
      { property: "og:title", content: "Akks-e-Noor — A Poster Archive" },
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
  if (f.orientations?.length && !f.orientations.includes(p.orientation || "portrait")) return false;
  return true;
}

type ViewMode = "grid" | "list" | "calendar";
type ReadingDirection = "ltr" | "rtl";

function Index() {
  const { posters, ready } = usePosters();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [open, setOpen] = useState<Poster | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("hijri-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [direction, setDirection] = useState<ReadingDirection>("ltr");
  const [selectedMonth, setSelectedMonth] = useState<string>("Muharram");

  const filtered = useMemo(
    () => sortPosters(posters.filter((p) => matches(p, query, filters)), sortOrder),
    [posters, query, filters, sortOrder]
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

  const handlePrev = () => {
    if (!open) return;
    const idx = filtered.findIndex((p) => p.id === open.id);
    if (idx !== -1) {
      const prevIdx = (idx - 1 + filtered.length) % filtered.length;
      setOpen(filtered[prevIdx]);
    }
  };

  const handleNext = () => {
    if (!open) return;
    const idx = filtered.findIndex((p) => p.id === open.id);
    if (idx !== -1) {
      const nextIdx = (idx + 1) % filtered.length;
      setOpen(filtered[nextIdx]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="bottom-center" />

      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-center gap-3 px-6 py-3 text-center">
          <div className="flex w-full items-center justify-between md:justify-center md:gap-8 relative">
            <div className="md:absolute md:left-6">
              <button
                onClick={() => setMobileFilters(true)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm md:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
            </div>
            <Link to="/" className="font-serif text-3xl tracking-tight">
              Akks-e-Noor<span className="text-accent">.</span>
            </Link>
            <div className="ml-auto md:absolute md:right-6">
              <Link
                to="/admin"
                className="rounded-full border border-foreground/80 px-4 py-2 text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Admin
              </Link>
            </div>
          </div>
          <div className="relative w-full max-w-xl hidden md:block mx-auto">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles and stories…"
              className="w-full rounded-full border border-border bg-secondary/40 py-2.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-foreground focus:bg-background text-center"
            />
          </div>
        </div>
        <div className="px-6 pb-4 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-full border border-border bg-secondary/40 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-foreground text-center"
            />
          </div>
        </div>
      </header>

      <section className="border-b border-border/60 bg-secondary/5">
        <div className="mx-auto max-w-[1600px] px-6 pt-8 pb-10 md:pt-10 md:pb-12 flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Akks-e-Noor Poster Archive</p>
          
          <h1 className="mt-3 font-serif text-4xl leading-[1.25] tracking-tight md:text-6xl flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
            <span>Light, ink, and remembrance</span>
            <span className="hidden md:inline text-muted-foreground/30">—</span>
            <span 
              className="font-noto text-[0.8em] md:text-[0.9em] text-primary antialiased leading-none py-1 md:py-0 whitespace-nowrap"
              dir="rtl"
            >
              نُور، جوہر اور یادِ خُدا
            </span>
          </h1>

          <p 
            className="mt-6 max-w-3xl text-[20px] md:text-[23px] text-muted-foreground text-center leading-relaxed"
          >
            A community service initiative archiving the original devotional artwork of{" "}
            <strong className="text-foreground font-serif font-extrabold tracking-tight underline decoration-accent/60 decoration-2 underline-offset-4 inline-block">
              Maulana Syed Imon Rizvi
            </strong>{" "}
            honoring the Fourteen Infallibles — organized by theme, by month, and by the occasions that gather us together.
          </p>
          
          {/* Line/divider */}
          <div className="my-6 w-full border-t border-border/60" />

          {/* Filters underneath the description */}
          <div className="w-full">
            <FilterPanel filters={filters} setFilters={setFilters} />
          </div>
        </div>
      </section>
 
      <div className="mx-auto max-w-[1600px] px-6 py-12">

        <main>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "poster" : "posters"}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {/* Sorting Controls */}
              <div className="flex items-center gap-1 rounded-full border border-border bg-secondary/20 p-1">
                <button
                  onClick={() => setSortOrder("hijri-asc")}
                  title="Sort from Day 1 to Day 30"
                  className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                    sortOrder === "hijri-asc" ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  1 → 30
                </button>
                <button
                  onClick={() => setSortOrder("hijri-desc")}
                  title="Sort from Day 30 to Day 1"
                  className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                    sortOrder === "hijri-desc" ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  30 → 1
                </button>
                <button
                  onClick={() => setSortOrder("date-desc")}
                  title="Show newest uploads first"
                  className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                    sortOrder === "date-desc" ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Newest
                </button>
              </div>

              {/* LTR / RTL Direction Switch */}
              <div className="flex items-center gap-1 rounded-full border border-border bg-secondary/20 p-1">
                <button
                  onClick={() => setDirection("ltr")}
                  title="Left-to-Right reading flow"
                  className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                    direction === "ltr" ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  LTR
                </button>
                <button
                  onClick={() => setDirection("rtl")}
                  title="Right-to-Left reading flow"
                  className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                    direction === "rtl" ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  RTL
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 rounded-full border border-border bg-secondary/20 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={`rounded-full p-1.5 transition-all ${
                    viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  className={`rounded-full p-1.5 transition-all ${
                    viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  aria-label="Calendar view"
                  className={`rounded-full p-1.5 transition-all ${
                    viewMode === "calendar" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-20 text-center">
              <p className="font-serif text-2xl">Nothing found</p>
              <p className="mt-2 text-sm text-muted-foreground">Try removing a filter or clearing your search.</p>
            </div>
          ) : viewMode === "calendar" ? (
            <div className="animate-in fade-in duration-200">
              {/* Islamic Month Tab Sub-selector */}
              <div className="flex justify-center gap-2 mb-8 border-b border-border/40 pb-4">
                {["Muharram", "Safar", "Rabi' al-Awwal"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(m)}
                    className={`rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                      selectedMonth === m
                        ? "bg-foreground text-background shadow-md scale-105"
                        : "border border-border/80 bg-background text-muted-foreground hover:border-foreground/50"
                    }`}
                  >
                    {m === "Rabi' al-Awwal" ? "Rabi-ul-Awwal" : m}
                  </button>
                ))}
              </div>

              {/* 30-Day Grid */}
              <div 
                dir={direction}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                  const posterForDay = filtered.find((p) => {
                    const matchesMonth = p.islamicMonths.includes(selectedMonth);
                    if (!matchesMonth) return false;
                    const match = p.hijriDate.match(/(\d+)/) || p.title.match(/(\d+)/);
                    const dayNum = match ? parseInt(match[1], 10) : 1;
                    return dayNum === day;
                  });

                  return (
                    <div 
                      key={day} 
                      dir="ltr"
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border flex flex-col items-center justify-center transition-all duration-300 ${
                        posterForDay 
                          ? "border-border/80 bg-secondary/15 cursor-pointer shadow-soft hover:shadow-lift hover:scale-[1.03]" 
                          : "border-border/40 bg-secondary/5 opacity-40 cursor-not-allowed select-none"
                      }`}
                      onClick={() => posterForDay && setOpen(posterForDay)}
                    >
                      {posterForDay ? (
                        <>
                          <ProgressiveImage
                            src={posterForDay.imageUrl}
                            placeholderSrc={posterForDay.imageUrl.replace("/posters/", "/posters/thumbnails/")}
                            alt={posterForDay.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-85"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[8px] font-bold text-amber-400 rounded-full px-2 py-0.5 uppercase tracking-wider">
                            Day {day}
                          </div>
                          <div className="absolute bottom-2 inset-x-2 text-left">
                            <p className="font-serif text-[10px] leading-tight text-white line-clamp-2">{posterForDay.title.split(" — ")[0]}</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2 text-center">
                          <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wide">Day {day}</span>
                          <span className="text-[8px] text-muted-foreground/45 mt-0.5 uppercase tracking-wider font-semibold">Empty</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div 
              dir={direction}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-200"
            >
              {filtered.map((p) => (
                <div key={p.id} dir="ltr">
                  <PosterCard poster={p} onOpen={setOpen} />
                </div>
              ))}
            </div>
          ) : (
            <div 
              dir={direction}
              className="divide-y divide-border/60 rounded-xl border border-border/60 bg-secondary/10 overflow-hidden animate-in fade-in duration-200"
            >
              {filtered.map((p) => (
                <div 
                  key={p.id} 
                  dir="ltr"
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/35"
                >
                  <div className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setOpen(p)}>
                    <ProgressiveImage
                      src={p.imageUrl}
                      placeholderSrc={p.imageUrl.replace("/posters/", "/posters/thumbnails/")}
                      alt={p.title}
                      className="h-full w-full rounded"
                    />
                  </div>
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setOpen(p)}>
                    <p className="font-serif text-base font-medium leading-none text-foreground">{p.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.hijriDate} {p.englishDate && `• ${p.englishDate}`}
                    </p>
                  </div>
                  <div className="hidden md:flex flex-wrap gap-1.5 max-w-[30%]">
                    {p.themes.map((t) => (
                      <span key={t} className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      toast.info("Starting download...");
                      const success = await downloadPoster(p);
                      if (success) toast.success("Download started");
                    }}
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-foreground hover:bg-foreground hover:text-background transition-all flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" /> Download
                  </button>
                  <button
                    onClick={() => setOpen(p)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-foreground hover:bg-foreground hover:text-background transition-all"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-border/60 py-10 text-center text-xs uppercase tracking-widest text-muted-foreground">
        Made with quiet care · Akks-e-Noor Archive · Original Work of <span className="whitespace-nowrap font-semibold text-foreground">Maulana Syed Imon Rizvi</span>
      </footer>

      <PosterModal
        poster={open}
        onClose={() => setOpen(null)}
        onPrev={filtered.length > 1 ? handlePrev : undefined}
        onNext={filtered.length > 1 ? handleNext : undefined}
      />

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
