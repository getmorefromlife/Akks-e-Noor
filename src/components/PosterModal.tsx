import { X, Share2, Calendar, Moon, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { sharePoster, sharePosterFile, downloadPoster, type Poster } from "@/lib/posters";
import { useEffect } from "react";

export function PosterModal({
  poster,
  onClose,
  onPrev,
  onNext,
}: {
  poster: Poster | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  useEffect(() => {
    if (!poster) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [poster, onClose, onPrev, onNext]);

  if (!poster) return null;

  const handleShare = async () => {
    const result = await sharePoster(poster);
    if (result === "copied") toast.success("Link copied to clipboard");
    else if (result === "failed") toast.error("Could not share");
  };

  const handleShareImage = async () => {
    toast.info("Preparing image file to share...");
    const result = await sharePosterFile(poster);
    if (result === "shared") {
      toast.success("Shared successfully!");
    } else if (result === "unsupported" || result === "fallback") {
      toast.warning("Direct image sharing not supported in this browser. Downloading instead...");
      await downloadPoster(poster);
    } else if (result === "failed") {
      toast.error("Could not share image.");
    }
  };

  const handleDownload = async () => {
    toast.info("Starting download...");
    const success = await downloadPoster(poster);
    if (success) toast.success("Download started");
  };

  const shareOrigin = typeof window !== "undefined"
    ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "https://akks-e-noor.vercel.app"
        : window.location.origin)
    : "";

  const whatsappUrl = typeof window !== "undefined"
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `Check out this devotional poster "${poster.title}" on Akks-e-Noor:\n${shareOrigin}/?poster=${poster.id}`
      )}`
    : "";

  const whatsappImageUrl = typeof window !== "undefined"
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `Check out this devotional poster "${poster.title}" from Akks-e-Noor:\n${shareOrigin}${poster.imageUrl}`
      )}`
    : "";

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

        <div className="bg-secondary/60 flex items-center justify-center p-4 min-h-[40vh] md:min-h-0 md:h-full max-h-[50vh] md:max-h-[92vh]">
          <img 
            src={poster.imageUrl} 
            alt={poster.title} 
            className="max-h-[45vh] md:max-h-[85vh] w-auto h-auto object-contain rounded shadow-sm transition-transform duration-300 hover:scale-[1.01]" 
          />
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

          <div className="mt-auto pt-8 flex flex-col gap-3">
            <button
              onClick={handleDownload}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-semibold uppercase tracking-widest transition-all hover:scale-[1.01] hover:opacity-90 shadow-sm cursor-pointer"
            >
              <Download className="h-4 w-4" /> Download Poster
            </button>
            
            {/* WhatsApp Sharing Block */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.01] hover:bg-[#20ba59] shadow-sm text-center"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.392 9.807-9.8.002-2.618-1.01-5.078-2.852-6.92C16.386 2.043 13.93 1.03 11.312 1.03 5.908 1.03 1.512 5.426 1.508 10.83c-.001 1.536.406 3.033 1.183 4.356l-.992 3.616 3.714-.974c1.295.706 2.766 1.082 4.14 1.082zM17.476 14.19c-.3-.15-1.77-.874-2.045-.974-.275-.1-.475-.15-.675.15-.2.3-.77.974-.945 1.174-.175.2-.35.225-.65.075-.3-.15-1.263-.465-2.403-1.485-.888-.79-1.488-1.77-1.663-2.07-.175-.3-.019-.463.13-.612.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.48-.51-.662-.513-.17-.003-.365-.003-.56-.003-.195 0-.51.075-.775.362-.265.288-1.015.992-1.015 2.42 0 1.427 1.04 2.802 1.185 3 .145.19 2.05 3.13 4.965 4.385.694.298 1.236.477 1.657.61.697.22 1.332.19 1.833.115.558-.083 1.77-.724 2.02-1.427.25-.703.25-1.303.175-1.427-.075-.125-.275-.2-.575-.35z"/>
                </svg>
                WhatsApp Link
              </a>
              <a
                href={whatsappImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#128C7E] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.01] hover:bg-[#0e7569] shadow-sm text-center"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.392 9.807-9.8.002-2.618-1.01-5.078-2.852-6.92C16.386 2.043 13.93 1.03 11.312 1.03 5.908 1.03 1.512 5.426 1.508 10.83c-.001 1.536.406 3.033 1.183 4.356l-.992 3.616 3.714-.974c1.295.706 2.766 1.082 4.14 1.082zM17.476 14.19c-.3-.15-1.77-.874-2.045-.974-.275-.1-.475-.15-.675.15-.2.3-.77.974-.945 1.174-.175.2-.35.225-.65.075-.3-.15-1.263-.465-2.403-1.485-.888-.79-1.488-1.77-1.663-2.07-.175-.3-.019-.463.13-.612.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.48-.51-.662-.513-.17-.003-.365-.003-.56-.003-.195 0-.51.075-.775.362-.265.288-1.015.992-1.015 2.42 0 1.427 1.04 2.802 1.185 3 .145.19 2.05 3.13 4.965 4.385.694.298 1.236.477 1.657.61.697.22 1.332.19 1.833.115.558-.083 1.77-.724 2.02-1.427.25-.703.25-1.303.175-1.427-.075-.125-.275-.2-.575-.35z"/>
                </svg>
                WhatsApp Image
              </a>
            </div>

            {/* General Share Options */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={handleShareImage}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground transition-all hover:scale-[1.01] hover:bg-secondary/45 hover:border-foreground cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" /> Share (System)
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground transition-all hover:scale-[1.01] hover:bg-secondary/45 hover:border-foreground cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" /> Copy Page Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Left Arrow Button */}
      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous Poster"
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 rounded-full bg-background/90 hover:bg-background p-2.5 md:p-3.5 text-foreground shadow-lift backdrop-blur-sm transition-all hover:scale-110 active:scale-95 focus:outline-none border border-border/40"
        >
          <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
        </button>
      )}

      {/* Right Arrow Button */}
      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next Poster"
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 rounded-full bg-background/90 hover:bg-background p-2.5 md:p-3.5 text-foreground shadow-lift backdrop-blur-sm transition-all hover:scale-110 active:scale-95 focus:outline-none border border-border/40"
        >
          <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
        </button>
      )}
    </div>
  );
}
