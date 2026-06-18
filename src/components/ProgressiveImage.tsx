import { useState, useEffect } from "react";

interface ProgressiveImageProps {
  src: string;
  placeholderSrc: string;
  alt: string;
  className?: string;
}

export function ProgressiveImage({ src, placeholderSrc, alt, className = "" }: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);

  useEffect(() => {
    // Reset state when source changes (e.g., in sliders or modals)
    setIsLoaded(false);
    setCurrentSrc(placeholderSrc);

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src, placeholderSrc]);

  return (
    <div className={`relative overflow-hidden bg-secondary/30 ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        className={`w-full h-auto block transition-all duration-500 ${
          isLoaded ? "filter-none scale-100" : "filter blur-lg scale-[1.03]"
        }`}
      />
    </div>
  );
}
