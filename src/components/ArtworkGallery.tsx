import { useEffect, useRef, useState } from "react";
import { Maximize2, Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ArtworkMedia } from "@/data/catalog";

const mediaClassName = "absolute inset-0 h-full w-full object-contain";

export function ArtworkGallery({ items }: { items: ArtworkMedia[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const videoCount = items.filter((item) => item.kind === "video").length;
  const photoCount = items.length - videoCount;
  const mediaCount = [
    photoCount && `${photoCount} ${photoCount === 1 ? "photo" : "photos"}`,
    videoCount && `${videoCount} ${videoCount === 1 ? "video" : "videos"}`,
  ].filter(Boolean).join(" · ");

  useEffect(() => {
    const strip = thumbnailsRef.current;
    const thumbnail = strip?.children[activeIndex];
    if (!strip || !(thumbnail instanceof HTMLElement) || strip.clientWidth === 0) return;

    const start = thumbnail.offsetLeft;
    const end = start + thumbnail.offsetWidth;
    if (start < strip.scrollLeft || end > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: start - (strip.clientWidth - thumbnail.offsetWidth) / 2 });
    }
  }, [activeIndex]);

  function scrollToMedia(index: number) {
    const gallery = galleryRef.current;
    if (!gallery) return;
    gallery.scrollTo({ left: gallery.clientWidth * index });
    setActiveIndex(index);
  }

  return (
    <div className="mx-auto w-[calc(100%_-_2.5rem)] min-w-0 max-w-80 md:w-full md:max-w-[38rem]">
      <div
        ref={galleryRef}
        onScroll={(event) => {
          const { clientWidth, scrollLeft } = event.currentTarget;
          if (clientWidth > 0) {
            setActiveIndex(Math.max(0, Math.min(items.length - 1, Math.round(scrollLeft / clientWidth))));
          }
        }}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-col md:gap-8 md:overflow-visible"
      >
        {items.map((item, index) => (
          <figure key={item.src} className="flex w-full shrink-0 snap-center flex-col justify-center md:glass-panel md:block md:p-3">
            <div
              className="relative h-[min(42svh,20rem)] w-full bg-secondary/20 md:h-auto md:max-h-[min(65svh,34rem)]"
              style={{ aspectRatio: item.kind === "video" ? "16 / 9" : `${item.width ?? 4} / ${item.height ?? 5}` }}
            >
              {item.kind === "video" ? (
                <video src={item.src} poster={item.poster} aria-label={item.alt} controls playsInline preload="none" className={mediaClassName} />
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      aria-label={`View full image: ${item.name || item.alt}`}
                      className="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                    >
                      <img
                        src={item.src}
                        alt={item.alt}
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : undefined}
                        decoding="async"
                        draggable={false}
                        className={mediaClassName}
                      />
                      <span className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-full bg-background/85 text-foreground">
                        <Maximize2 className="size-4" aria-hidden="true" />
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    aria-describedby={undefined}
                    className="w-[calc(100%_-_1rem)] max-w-7xl gap-0 p-2 pt-14 sm:p-4 sm:pt-16 [&>button]:right-2 [&>button]:top-2 [&>button]:grid [&>button]:size-11 [&>button]:place-items-center"
                  >
                    <DialogTitle className="sr-only">{item.name || item.alt}</DialogTitle>
                    <img src={item.src} alt={item.alt} className="h-[calc(100dvh_-_5.25rem)] w-full object-contain sm:h-[calc(100dvh_-_7rem)]" />
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {item.name && (
              <figcaption className="break-words px-2 pt-2 text-center text-xs leading-5 text-muted-foreground md:pb-2 md:pt-4 md:text-left">
                {item.name}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-4 border-t border-border pt-3 md:hidden" role="group" aria-label="Artwork media navigation">
          <p className="text-xs font-medium text-foreground">{mediaCount}</p>
          <div
            ref={thumbnailsRef}
            className="relative mt-1 flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, index) => {
              const thumbnail = item.kind === "video" ? item.poster : item.thumbnail || item.src;
              return (
                <button
                  key={item.src}
                  type="button"
                  aria-label={`Show ${item.name || item.alt} (item ${index + 1})`}
                  aria-current={activeIndex === index}
                  onClick={() => scrollToMedia(index)}
                  className="relative grid size-13 shrink-0 cursor-pointer place-items-center rounded-md border border-border bg-secondary p-0.5 transition-colors hover:border-primary/70 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary aria-[current=true]:border-primary aria-[current=true]:bg-primary/20"
                >
                  {thumbnail && <img src={thumbnail} alt="" loading="lazy" decoding="async" className="size-full rounded object-cover" />}
                  {item.kind === "video" && (
                    <span className="absolute grid size-6 place-items-center rounded-full bg-background/80 text-foreground">
                      <Play className="size-3" aria-hidden="true" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
