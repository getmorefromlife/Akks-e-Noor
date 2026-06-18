import { X, Share2, Calendar, Moon } from "lucide-react";
import { toast } from "sonner";
import { sharePoster, type Poster } from "@/lib/posters";
import { useEffect } from "react";

export function PosterModal({ poster, onClose }: { poster: Poster | null; onClose: () => void }) {
  useEffect(() => {
    if (!poster) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [poster, onClose]);

  if (!poster) return null;

  const handleShare = async () => {
    const result = await sharePoster(poster);
    if (result === "copied") toast.success("Link copied to clipboard");
    else if (result === "failed") toast.error("Could not share");
  };

  const tags = [
    ...poster.themes,
    ...poster.masoomeen,
    ...poster.islamicMonths,
    ...poster.occasions,
    ...poster.calendarMonths,
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-xl bg-background shadow-lift md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full bg-background/90 p-2 text-foreground shadow-soft transition-transform hover:scale-110"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-secondary/60 flex items-center justify-center overflow-auto max-h-[50vh] md:max-h-none">
          <img src={poster.imageUrl} alt={poster.title} className="h-full w-full object-contain" />
        </div>

        <div className="flex flex-col overflow-y-auto p-8 md:p-10">
          <h2 className="font-serif text-3xl leading-tight md:text-4xl">{poster.title}</h2>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {poster.englishDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Moon className="h-3.5 w-3.5" /> {poster.hijriDate}
            </span>
          </div>

          <p className="mt-6 leading-relaxed text-foreground/85">{poster.description}</p>

          {tags.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-8">
            <button
              onClick={handleShare}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm uppercase tracking-widest text-background transition-transform hover:scale-[1.02]"
            >
              <Share2 className="h-4 w-4" /> Share this poster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
