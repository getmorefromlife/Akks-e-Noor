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
  orientation?: string;
};

import staticPosters from "./posters.json";

const KEY_LOCAL = "posters.local.v1";
const KEY_DELETED = "posters.deleted.v1";

function readLocal(): Poster[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_LOCAL);
    return raw ? (JSON.parse(raw) as Poster[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: Poster[]) {
  localStorage.setItem(KEY_LOCAL, JSON.stringify(list));
  window.dispatchEvent(new Event("posters:updated"));
}

function readDeleted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_DELETED);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeDeleted(list: string[]) {
  localStorage.setItem(KEY_DELETED, JSON.stringify(list));
  window.dispatchEvent(new Event("posters:updated"));
}

export function usePosters() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [ready, setReady] = useState(false);

  const getMerged = useCallback(() => {
    const local = readLocal();
    const deleted = readDeleted();
    const all = [...local, ...staticPosters];
    return all.filter((p) => !deleted.includes(p.id));
  }, []);

  useEffect(() => {
    setPosters(getMerged());
    setReady(true);
    const onUpdate = () => setPosters(getMerged());
    window.addEventListener("posters:updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("posters:updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [getMerged]);

  const add = useCallback((p: Omit<Poster, "id" | "createdAt">) => {
    const next: Poster = { ...p, id: crypto.randomUUID(), createdAt: Date.now() };
    writeLocal([next, ...readLocal()]);
  }, []);

  const remove = useCallback((id: string) => {
    const local = readLocal();
    const nextLocal = local.filter((p) => p.id !== id);
    if (nextLocal.length !== local.length) {
      writeLocal(nextLocal);
    } else {
      const deleted = readDeleted();
      if (!deleted.includes(id)) {
        writeDeleted([...deleted, id]);
      }
    }
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

export async function sharePosterFile(p: Poster): Promise<"shared" | "fallback" | "unsupported" | "failed"> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return "unsupported";
  }
  try {
    const response = await fetch(p.imageUrl);
    const blob = await response.blob();
    const extension = p.imageUrl.endsWith(".png") ? "png" : p.imageUrl.endsWith(".jpeg") ? "jpeg" : "jpg";
    const filename = `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${extension}`;
    const mimeType = extension === "png" ? "image/png" : "image/jpeg";
    const file = new File([blob], filename, { type: mimeType });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: p.title,
        text: `Check out this devotional poster "${p.title}" on Akks-e-Noor`,
      });
      return "shared";
    }
    return "fallback";
  } catch (err) {
    console.error("Failed to share file", err);
    return "failed";
  }
}

export async function downloadPoster(p: Poster) {
  try {
    const response = await fetch(p.imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Extract file extension from imageUrl if possible, default to jpg
    const extension = p.imageUrl.endsWith(".png") ? "png" : p.imageUrl.endsWith(".jpeg") ? "jpeg" : "jpg";
    const filename = `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${extension}`;
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("Failed to download image", err);
    // Fallback: open in new tab
    const a = document.createElement("a");
    a.href = p.imageUrl;
    a.target = "_blank";
    a.download = p.title;
    a.click();
    return false;
  }
}

export type SortOrder = "hijri-asc" | "hijri-desc" | "date-desc" | "date-asc";

export function getHijriSortScore(p: Poster): number {
  if (!p.islamicMonths || p.islamicMonths.length === 0) return 9999;
  const month = p.islamicMonths[0];
  const monthIdx = ISLAMIC_MONTHS.indexOf(month as any);
  const monthScore = monthIdx !== -1 ? monthIdx : 99;

  // Extract the first number in hijriDate or title
  const match = p.hijriDate.match(/(\d+)/) || p.title.match(/(\d+)/);
  const day = match ? parseInt(match[1], 10) : 1;

  return monthScore * 100 + day;
}

export function sortPosters(list: Poster[], order: SortOrder): Poster[] {
  return [...list].sort((a, b) => {
    if (order === "hijri-asc") {
      return getHijriSortScore(a) - getHijriSortScore(b);
    }
    if (order === "hijri-desc") {
      return getHijriSortScore(b) - getHijriSortScore(a);
    }
    if (order === "date-desc") {
      return b.createdAt - a.createdAt;
    }
    if (order === "date-asc") {
      return a.createdAt - b.createdAt;
    }
    return 0;
  });
}


