import { useState, useEffect, useCallback } from "react";
import { Sparkles, ChevronLeft, ChevronRight, Quote, Heart } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { getCollectorIdentity, type CollectorReview } from "@/data/reviews";

interface CollectorReviewsSectionProps {
  reviews: CollectorReview[];
}

export function CollectorReviewsSection({ reviews }: CollectorReviewsSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay timer with pause-on-hover
  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        // Animate back across the existing cards before starting again.
        emblaApi.scrollTo(0);
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [emblaApi, isPaused, selectedIndex]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  if (!reviews || reviews.length === 0) return null;

  return (
    <section
      className="relative mx-auto max-w-[1550px] px-5 py-24 sm:px-10 lg:py-32 overflow-hidden"
      aria-labelledby="collector-reflections-heading"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Editorial Header */}
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b border-border/50 pb-10">
        <div className="max-w-2xl">
          <div className="botanical-rule w-fit eyebrow">Collector reflections</div>
          <h2
            id="collector-reflections-heading"
            className="mt-6 text-5xl leading-[1.02] sm:text-6xl lg:text-7xl"
          >
            Treasured in homes,
            <br />
            <em className="text-accent">held in hearts.</em>
          </h2>
          <p className="mt-4 font-display text-xl italic text-foreground/90 sm:text-2xl">
            Every element has a level of care, artistry and love.
          </p>
          <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
            Unscripted words from collectors who welcomed our one-of-a-kind celestial figures,
            guardian angels, and embroidered sculptures into their private worlds.
          </p>
        </div>
      </div>

      {/* Navigation sits beside the cards, centered vertically. */}
      <div className="relative mt-14 grid grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-2 -mx-3 sm:-mx-6 sm:grid-cols-[3rem_minmax(0,1fr)_3rem] sm:gap-4">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Previous collector review"
          className="group relative flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-primary/35 bg-background/60 backdrop-blur-md transition-all duration-300 enabled:hover:border-primary enabled:hover:bg-primary enabled:hover:text-primary-foreground enabled:hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
        >
          <ChevronLeft
            className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5"
            strokeWidth={1.3}
          />
        </button>
        {/* Embla Slider Viewport */}
        <div className="min-w-0 overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-6 touch-pan-y">
            {reviews.map((review, index) => {
              const isDark = review.theme === "dark";
              const collector = getCollectorIdentity(review);
              return (
                <div
                  key={review.id || index}
                  className="min-w-0 shrink-0 grow-0 basis-full pl-6 md:basis-1/2 lg:basis-1/3"
                >
                  <article
                    className={`group relative flex h-full flex-col justify-between p-8 sm:p-9 rounded-sm transition-all duration-500 ease-out select-none ${
                      isDark
                        ? "glass-panel bg-background/85 border-border/70 hover:border-primary/70 hover:shadow-[0_22px_55px_-18px_oklch(0.77_0.12_86_/_0.28)] hover:-translate-y-2.5"
                        : "glass-panel bg-primary/[0.045] border-primary/30 hover:border-primary/80 hover:shadow-[0_22px_55px_-18px_oklch(0.77_0.12_86_/_0.32)] hover:-translate-y-2.5"
                    }`}
                  >
                    {/* Subtle inner ambient glow on hover */}
                    <div className="pointer-events-none absolute inset-0 rounded-sm bg-gradient-to-b from-primary/10 via-transparent to-primary/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                    {/* Corner Accent Sparkle */}
                    <div className="pointer-events-none absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-primary/30 transition-all duration-500 group-hover:scale-150 group-hover:bg-accent group-hover:shadow-[0_0_10px_var(--color-accent)]" />

                    {/* Watermark Quote Mark */}
                    <Quote
                      className="pointer-events-none absolute right-7 top-6 h-12 w-12 text-primary/5 transition-all duration-700 group-hover:scale-110 group-hover:text-primary/15"
                      strokeWidth={1}
                    />

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-1 flex-col">
                      {/* Stars and Verified Badge */}
                      <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-4">
                        <div
                          className="flex items-center gap-1.5 text-accent"
                          aria-label={`${review.stars} out of 5 stars`}
                        >
                          {[...Array(review.stars)].map((_, i) => (
                            <span
                              key={i}
                              className="inline-block text-sm leading-none text-accent transition-transform duration-300 group-hover:scale-110"
                              style={{ transitionDelay: `${i * 45}ms` }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.24em] text-muted-foreground/80">
                          <Heart
                            className="h-2.5 w-2.5 text-primary/80 transition-colors group-hover:text-primary"
                            strokeWidth={1.2}
                          />
                          Verified Acquisition
                        </span>
                      </div>

                      {/* Card Title */}
                      <h3 className="mt-6 font-display text-2xl font-normal leading-snug text-foreground transition-colors duration-300 group-hover:text-accent sm:text-[1.65rem]">
                        {review.title}
                      </h3>

                      {/* Review Quote */}
                      <p className="mt-4 flex-1 font-display text-[0.98rem] italic leading-relaxed text-foreground/85 transition-colors duration-300 group-hover:text-foreground whitespace-pre-line">
                        {review.quote}
                      </p>
                    </div>

                    {/* Collector details from CMS, above the verification rule. */}
                    <footer className="relative z-10 mt-8">
                      {(collector.name || collector.location) && (
                        <div className="mb-5">
                          {collector.name && (
                            <p className="font-display text-lg leading-snug text-foreground transition-colors duration-300 group-hover:text-accent">
                              {collector.name}
                            </p>
                          )}
                          {collector.location && (
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {collector.location}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="border-t border-border/40 pt-5">
                        <p className="text-[9px] uppercase tracking-[.22em] text-muted-foreground transition-colors duration-300 group-hover:text-primary">
                          Verified Collector
                        </p>
                      </div>
                    </footer>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Next collector review"
          className="group relative flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-primary/35 bg-background/60 backdrop-blur-md transition-all duration-300 enabled:hover:border-primary enabled:hover:bg-primary enabled:hover:text-primary-foreground enabled:hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
        >
          <ChevronRight
            className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={1.3}
          />
        </button>
      </div>

      {/* Pagination Dot Indicators */}
      <div className="mt-12 flex items-center justify-center gap-2">
        {scrollSnaps.map((_, index) => {
          const isActive = index === selectedIndex;
          return (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 transition-all duration-500 rounded-full cursor-pointer ${
                isActive
                  ? "w-8 bg-primary shadow-[0_0_12px_var(--color-primary)]"
                  : "w-2 bg-primary/25 hover:bg-primary/50"
              }`}
            />
          );
        })}
      </div>

      {/* Bottom Quiet Reassurance */}
      <div className="mt-12 flex items-center justify-center gap-3 text-center">
        <Sparkles className="h-3 w-3 text-primary animate-soft-pulse" strokeWidth={1} />
        <p className="text-[9px] uppercase tracking-[.26em] text-primary">
          Every artwork is made once by hand · Preserving singular stories
        </p>
        <Sparkles className="h-3 w-3 text-primary animate-soft-pulse" strokeWidth={1} />
      </div>
    </section>
  );
}
