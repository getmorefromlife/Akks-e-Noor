import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Toaster, toast } from "sonner";
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import {
  usePosters, THEMES, CALENDAR_MONTHS, ISLAMIC_MONTHS, MASOOMEEN, OCCASIONS,
  sortPosters, type SortOrder
} from "@/lib/posters";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Akks-e-Noor" },
      { name: "description", content: "Upload and manage poster archive entries." },
    ],
  }),
  component: Admin,
});

type Form = {
  title: string;
  description: string;
  imageUrl: string;
  englishDate: string;
  hijriDate: string;
  themes: string[];
  calendarMonths: string[];
  islamicMonths: string[];
  masoomeen: string[];
  occasions: string[];
};

const empty: Form = {
  title: "", description: "", imageUrl: "", englishDate: "", hijriDate: "",
  themes: [], calendarMonths: [], islamicMonths: [], masoomeen: [], occasions: [],
};

function CheckGroup({
  label, options, value, onChange,
}: { label: string; options: readonly string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <p className="font-serif text-lg">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value.includes(o);
          return (
            <button
              type="button"
              key={o}
              onClick={() => onChange(active ? value.filter((x) => x !== o) : [...value, o])}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

async function sha256(str: string) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const DEFAULT_HASH = "8df24958e761884bd34fa2a0df830b14bf81bd04b48fda4350b4a54e9d02e138"; // default: Square786++
const HASH = (import.meta.env.VITE_ADMIN_PASSWORD_HASH) || DEFAULT_HASH;

function Admin() {
  const { posters, add, remove } = usePosters();
  const [form, setForm] = useState<Form>(empty);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("akks_e_noor_admin_auth") === "true";
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>("hijri-asc");

  const sortedPosters = useMemo(() => sortPosters(posters, sortOrder), [posters, sortOrder]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = await sha256(password);
    if (hash === HASH) {
      sessionStorage.setItem("akks_e_noor_admin_auth", "true");
      setIsAuthenticated(true);
      toast.success("Authenticated successfully");
    } else {
      toast.error("Incorrect password");
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(posters, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "posters.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Archive exported as posters.json");
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, imageUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.imageUrl) {
      toast.error("Title and image are required");
      return;
    }
    add(form);
    setForm(empty);
    toast.success("Poster added to local session");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6">
        <Toaster position="bottom-center" />
        <div className="w-full max-w-md space-y-8 text-center animate-in fade-in duration-300">
          <div>
            <Link to="/" className="font-serif text-3xl tracking-tight">
              Akks-e-Noor<span className="text-accent">.</span>
            </Link>
            <h2 className="mt-6 font-serif text-2xl tracking-tight text-foreground">
              Admin Portal
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the password to access poster archive settings.
            </p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-full border border-border bg-secondary/40 px-5 py-3 text-center text-sm outline-none transition-all focus:border-foreground focus:bg-background"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-foreground px-5 py-3 text-sm uppercase tracking-widest text-background transition-transform hover:scale-[1.02]"
            >
              Sign In
            </button>
          </form>
          <div className="pt-4">
            <Link to="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="bottom-center" />
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to gallery
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sessionStorage.removeItem("akks_e_noor_admin_auth");
                setIsAuthenticated(false);
              }}
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Log Out
            </button>
            <span className="font-serif text-xl border-l pl-4 border-border">Admin</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="font-serif text-4xl md:text-5xl">Add a new poster</h1>
        <p className="mt-2 text-muted-foreground">Upload an image, write its story, and assign it to categories.</p>

        <form onSubmit={submit} className="mt-10 grid gap-10 md:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Image</label>
              <label className="mt-2 flex aspect-[3/4] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-secondary/30 transition-colors hover:border-foreground">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">Click to upload an image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
              <input
                value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="…or paste image URL"
                className="mt-3 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-foreground"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Description / Story</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">English Date</label>
                <input
                  type="date"
                  value={form.englishDate}
                  onChange={(e) => setForm({ ...form, englishDate: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Hijri Date</label>
                <input
                  value={form.hijriDate}
                  onChange={(e) => setForm({ ...form, hijriDate: e.target.value })}
                  placeholder="e.g. 12 Rabi' al-Awwal 1446"
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 md:col-span-2">
            <CheckGroup label="Themes" options={THEMES}
              value={form.themes} onChange={(v) => setForm({ ...form, themes: v })} />
            <CheckGroup label="14 Masoomeen" options={MASOOMEEN}
              value={form.masoomeen} onChange={(v) => setForm({ ...form, masoomeen: v })} />
            <CheckGroup label="Islamic Months" options={ISLAMIC_MONTHS}
              value={form.islamicMonths} onChange={(v) => setForm({ ...form, islamicMonths: v })} />
            <CheckGroup label="Occasions" options={OCCASIONS}
              value={form.occasions} onChange={(v) => setForm({ ...form, occasions: v })} />
            <CheckGroup label="Calendar Months" options={CALENDAR_MONTHS}
              value={form.calendarMonths} onChange={(v) => setForm({ ...form, calendarMonths: v })} />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-foreground px-8 py-3 text-sm uppercase tracking-widest text-background transition-transform hover:scale-[1.02]"
            >
              Add poster
            </button>
          </div>
        </form>

        <section className="mt-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-3xl">Archive ({posters.length})</h2>
            <div className="flex flex-wrap items-center gap-4">
              {/* Rearrange controls in admin */}
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

              <button
                onClick={handleExport}
                className="rounded-full border border-foreground/85 px-4 py-2 text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
              >
                Export Archive (JSON)
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedPosters.map((p) => (
              <div key={p.id} className="flex gap-4 rounded-lg border border-border bg-secondary/30 p-3 animate-in fade-in duration-200">
                <img src={p.imageUrl} alt={p.title} className="h-20 w-20 flex-none rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-lg">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.hijriDate || p.englishDate}</p>
                  <button
                    onClick={() => { remove(p.id); toast.success("Removed"); }}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
