import { Share2, Download } from "lucide-react";
import { toast } from "sonner";
import { sharePoster, downloadPoster, type Poster } from "@/lib/posters";
import { ProgressiveImage } from "./ProgressiveImage";

export function PosterCard({ poster, onOpen }: { poster: Poster; onOpen: (p: Poster) => void }) {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await sharePoster(poster);
    if (result === "copied") toast.success("Link copied to clipboard");
    else if (result === "failed") toast.error("Could not share");
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info("Starting download...");
    const success = await downloadPoster(poster);
    if (success) toast.success("Download started");
  };

  const thumbnailSrc = poster.imageUrl.replace("/posters/", "/posters/thumbnails/");

  return (
    <div
      className="group relative mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-lg bg-secondary/40 shadow-soft transition-all hover:shadow-lift"
      onClick={() => onOpen(poster)}
    >
      <ProgressiveImage
        src={poster.imageUrl}
        placeholderSrc={thumbnailSrc}
        alt={poster.title}
        className="w-full transition-transform duration-700 group-hover:scale-[1.02]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="text-background min-w-0 flex-1">
          <h3 className="font-serif text-lg leading-tight truncate">{poster.title}</h3>
          <p className="text-xs uppercase tracking-widest opacity-80">{poster.hijriDate}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleDownload}
            aria-label="Download poster"
            className="pointer-events-auto rounded-full bg-background/95 p-2.5 text-foreground shadow-soft transition-transform hover:scale-110"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleShare}
            aria-label="Share poster"
            className="pointer-events-auto rounded-full bg-background/95 p-2.5 text-foreground shadow-soft transition-transform hover:scale-110"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
