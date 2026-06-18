import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { sharePoster, type Poster } from "@/lib/posters";

export function PosterCard({ poster, onOpen }: { poster: Poster; onOpen: (p: Poster) => void }) {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await sharePoster(poster);
    if (result === "copied") toast.success("Link copied to clipboard");
    else if (result === "failed") toast.error("Could not share");
  };

  return (
    <div
      className="group relative mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-lg bg-secondary/40 shadow-soft transition-all hover:shadow-lift"
      onClick={() => onOpen(poster)}
    >
      <img
        src={poster.imageUrl}
        alt={poster.title}
        loading="lazy"
        className="w-full transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="text-background">
          <h3 className="font-serif text-lg leading-tight">{poster.title}</h3>
          <p className="text-xs uppercase tracking-widest opacity-80">{poster.hijriDate}</p>
        </div>
        <button
          onClick={handleShare}
          aria-label="Share poster"
          className="pointer-events-auto rounded-full bg-background/95 p-2.5 text-foreground shadow-soft transition-transform hover:scale-110"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
