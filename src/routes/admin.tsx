import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import {
  usePosters, THEMES, CALENDAR_MONTHS, ISLAMIC_MONTHS, MASOOMEEN, OCCASIONS,
} from "@/lib/posters";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Mahfil" },
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

function Admin() {
  const { posters, add, remove } = usePosters();
  const [form, setForm] = useState<Form>(empty);

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
    toast.success("Poster added to the archive");
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="bottom-center" />
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to gallery
          </Link>
          <span className="font-serif text-xl">Admin</span>
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
          <h2 className="font-serif text-3xl">Archive ({posters.length})</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posters.map((p) => (
              <div key={p.id} className="flex gap-4 rounded-lg border border-border bg-secondary/30 p-3">
                <img src={p.imageUrl} alt={p.title} className="h-20 w-20 flex-none rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-lg">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.hijriDate}</p>
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
