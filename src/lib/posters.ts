import { useEffect, useState, useCallback } from "react";

export const THEMES = ["Typography", "Conceptual", "Abstract", "Calligraphy", "Minimalist", "Illustrative"] as const;

export const CALENDAR_MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
] as const;

export const ISLAMIC_MONTHS = [
  "Muharram","Safar","Rabi' al-Awwal","Rabi' al-Thani","Jumada al-Awwal","Jumada al-Thani",
  "Rajab","Sha'ban","Ramadan","Shawwal","Dhu al-Qi'dah","Dhu al-Hijjah",
] as const;

export const MASOOMEEN = [
  "Prophet Muhammad (s)",
  "Imam Ali (a)",
  "Lady Fatima (a)",
  "Imam Hasan (a)",
  "Imam Husayn (a)",
  "Imam Ali Zayn al-Abidin (a)",
  "Imam Muhammad al-Baqir (a)",
  "Imam Ja'far al-Sadiq (a)",
  "Imam Musa al-Kadhim (a)",
  "Imam Ali al-Rida (a)",
  "Imam Muhammad al-Jawad (a)",
  "Imam Ali al-Hadi (a)",
  "Imam Hasan al-Askari (a)",
  "Imam al-Mahdi (aj)",
] as const;

export const OCCASIONS = ["Wiladah / Birth", "Shahadah / Martyrdom"] as const;

export type Poster = {
  id: string;
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
  createdAt: number;
};

const KEY = "posters.v1";

const SEED: Poster[] = [
  {
    id: "seed-1",
    title: "Light of Rabi' al-Awwal",
    description: "A typographic tribute to the blessed birth, weaving classical Thuluth strokes through a quiet field of cream.",
    imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200&q=80",
    englishDate: "2024-09-15",
    hijriDate: "12 Rabi' al-Awwal 1446",
    themes: ["Typography", "Calligraphy"],
    calendarMonths: ["September"],
    islamicMonths: ["Rabi' al-Awwal"],
    masoomeen: ["Prophet Muhammad (s)"],
    occasions: ["Wiladah / Birth"],
    createdAt: Date.now() - 100000,
  },
  {
    id: "seed-2",
    title: "Ashura — Sands of Karbala",
    description: "Abstract dunes meet a single horizon line in mourning. A meditation on patience and remembrance.",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&q=80",
    englishDate: "2024-07-16",
    hijriDate: "10 Muharram 1446",
    themes: ["Abstract", "Conceptual"],
    calendarMonths: ["July"],
    islamicMonths: ["Muharram"],
    masoomeen: ["Imam Husayn (a)"],
    occasions: ["Shahadah / Martyrdom"],
    createdAt: Date.now() - 80000,
  },
  {
    id: "seed-3",
    title: "Fatima — The Radiant",
    description: "Minimal geometry honoring Lady Fatima (a). A circle of light suspended on a warm field.",
    imageUrl: "https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=1200&q=80",
    englishDate: "2024-02-23",
    hijriDate: "20 Jumada al-Thani 1445",
    themes: ["Minimalist", "Conceptual"],
    calendarMonths: ["February"],
    islamicMonths: ["Jumada al-Thani"],
    masoomeen: ["Lady Fatima (a)"],
    occasions: ["Wiladah / Birth"],
    createdAt: Date.now() - 60000,
  },
  {
    id: "seed-4",
    title: "Ghadir — A Covenant",
    description: "Calligraphic banner commemorating the day of Ghadir Khumm.",
    imageUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1200&q=80",
    englishDate: "2024-06-25",
    hijriDate: "18 Dhu al-Hijjah 1445",
    themes: ["Calligraphy", "Typography"],
    calendarMonths: ["June"],
    islamicMonths: ["Dhu al-Hijjah"],
    masoomeen: ["Imam Ali (a)"],
    occasions: ["Wiladah / Birth"],
    createdAt: Date.now() - 40000,
  },
];

function read(): Poster[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw) as Poster[];
  } catch {
    return SEED;
  }
}

function write(list: Poster[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("posters:updated"));
}

export function usePosters() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPosters(read());
    setReady(true);
    const onUpdate = () => setPosters(read());
    window.addEventListener("posters:updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("posters:updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const add = useCallback((p: Omit<Poster, "id" | "createdAt">) => {
    const next: Poster = { ...p, id: crypto.randomUUID(), createdAt: Date.now() };
    write([next, ...read()]);
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((p) => p.id !== id));
  }, []);

  return { posters, ready, add, remove };
}

export async function sharePoster(p: Poster) {
  const url = `${window.location.origin}/?poster=${p.id}`;
  const shareData = { title: p.title, text: p.description, url };
  if (typeof navigator !== "undefined" && (navigator as any).share) {
    try {
      await (navigator as any).share(shareData);
      return "shared" as const;
    } catch {
      return "cancelled" as const;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied" as const;
  } catch {
    return "failed" as const;
  }
}
