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
    containScroll: false,
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 48rem)": { slidesToScroll: 2 },
      "(min-width: 64rem)": { slidesToScroll: 3 },
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [hasMultipleSets, setHasMultipleSets] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setHasMultipleSets(emblaApi.scrollSnapList().length > 1);
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

  useEffect(() => {
    if (!emblaApi) return;

    const viewport = emblaApi.rootNode();
    const setViewportHeight = (slide: Element) => {
      viewport.style.setProperty(
        "--review-viewport-height",
        `${slide.getBoundingClientRect().height}px`,
      );
    };
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setViewportHeight(entry.target);
    });

    const observeSelectedSlide = () => {
      observer.disconnect();
      const slide = emblaApi.slideNodes()[emblaApi.selectedScrollSnap()];
      if (slide) {
        observer.observe(slide);
        setViewportHeight(slide);
      } else {
        viewport.style.removeProperty("--review-viewport-height");
      }
    };

    emblaApi.on("select", observeSelectedSlide);
    emblaApi.on("reInit", observeSelectedSlide);
    observeSelectedSlide();

    return () => {
      observer.disconnect();
      emblaApi.off("select", observeSelectedSlide);
      emblaApi.off("reInit", observeSelectedSlide);
      viewport.style.removeProperty("--review-viewport-height");
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    if (emblaApi.canScrollNext()) {
      emblaApi.scrollNext();
    } else {
      emblaApi.scrollTo(0);
    }
  }, [emblaApi]);

  // Mobile cards change height, so keep the page steady while the collector reads.
  useEffect(() => {
    if (isPaused || !hasMultipleSets) return;
    const multipleCards = window.matchMedia("(min-width: 48rem)");
    const interval = setInterval(() => {
      if (multipleCards.matches) scrollNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [hasMultipleSets, isPaused, scrollNext, selectedIndex]);

  if (!reviews || reviews.length === 0) return null;

  return (
    <section
      className="relative mx-auto max-w-[1550px] overflow-hidden px-4 py-7 sm:px-10 md:py-24 lg:py-20"
      aria-labelledby="collector-reflections-heading"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Editorial Header */}
      <div className="flex flex-col gap-8 border-b border-border/50 pb-5 md:flex-row md:items-end md:justify-between md:pb-10">
        <div className="max-w-2xl">
          <div className="botanical-rule w-fit eyebrow">REFLECTIONS FROM OUR COLLECTORS</div>
          <h2
            id="collector-reflections-heading"
            className="mt-4 text-4xl leading-[1.02] sm:text-6xl md:mt-6 lg:text-7xl"
          >
            Treasured in homes,
            <br />
            <em className="text-accent">held in hearts.</em>
          </h2>
          <p className="mt-3 font-display text-xl italic text-foreground/90 sm:text-2xl md:mt-4">
            Every element has a level of care, artistry and love.
          </p>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground md:mt-3 md:leading-7">
            Unscripted words from collectors who welcomed our one-of-a-kind celestial figures,
            guardian angels, and embroidered sculptures into their private worlds.
          </p>
        </div>
      </div>

      <div className="relative -mx-2 mt-5 grid grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-1 md:-mx-6 md:mt-14 md:grid-cols-[3rem_minmax(0,1fr)_3rem] md:gap-4">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Previous collector review"
          className="group relative flex size-8 items-center justify-center rounded-full border border-primary/35 bg-background/60 shadow-md backdrop-blur-md transition-all duration-300 enabled:hover:scale-105 enabled:hover:border-primary enabled:hover:bg-primary enabled:hover:text-primary-foreground active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 max-md:after:absolute max-md:after:-inset-1.5 md:size-12"
        >
          <ChevronLeft
            className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5"
            strokeWidth={1.3}
          />
        </button>
        {/* Embla Slider Viewport */}
        <div className="min-w-0 overflow-hidden max-md:h-(--review-viewport-height)" ref={emblaRef}>
          <div className="flex touch-pan-y max-md:items-start md:-ml-6">
            {reviews.map((review, index) => {
              const isDark = review.theme === "dark";
              const collector = getCollectorIdentity(review);
              return (
                <div
                  key={review.id || index}
                  className="min-w-0 shrink-0 grow-0 basis-full md:basis-1/2 md:pl-6 lg:basis-1/3"
                >
                  <article
                    className={`group relative flex flex-col rounded-sm p-4 transition-all duration-500 ease-out select-none sm:p-6 md:h-full md:justify-between md:p-9 ${
                      isDark
                        ? "glass-panel bg-background/85 border-border/70 hover:border-primary/70 hover:shadow-[0_22px_55px_-18px_oklch(0.77_0.12_86_/_0.28)] md:hover:-translate-y-2.5"
                        : "glass-panel bg-primary/[0.045] border-primary/30 hover:border-primary/80 hover:shadow-[0_22px_55px_-18px_oklch(0.77_0.12_86_/_0.32)] md:hover:-translate-y-2.5"
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
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border/40 pb-3 md:pb-4">
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
                      <h3 className="mt-3 font-display text-2xl font-normal leading-snug text-foreground transition-colors duration-300 group-hover:text-accent md:mt-6 md:text-[1.65rem]">
                        {review.title}
                      </h3>

                      {/* Review Quote */}
                      <p className="mt-2 font-display text-[0.98rem] italic leading-relaxed whitespace-pre-line text-foreground/85 transition-colors duration-300 group-hover:text-foreground md:mt-4 md:flex-1">
                        {review.quote}
                      </p>
                    </div>

                    {/* Collector details from CMS, above the verification rule. */}
                    <footer className="@container relative z-10 mt-4 md:mt-8">
                      {(collector.name || collector.location) && (
                        <p className="mb-3 flex items-baseline gap-0.5 md:mb-5 @min-[13rem]:gap-1">
                          {collector.name && (
                            <span
                              className="min-w-0 shrink-[0.5] truncate font-display text-[clamp(0.875rem,7cqi,1.125rem)] leading-snug text-foreground transition-colors duration-300 group-hover:text-accent"
                              title={collector.name}
                            >
                              {collector.name}
                            </span>
                          )}
                          {collector.name && collector.location && (
                            <span
                              aria-hidden="true"
                              className="shrink-0 text-xs text-muted-foreground"
                            >
                              ·
                            </span>
                          )}
                          {collector.location && (
                            <span
                              className="min-w-0 truncate text-[clamp(0.625rem,5.2cqi,0.75rem)] leading-relaxed text-muted-foreground"
                              title={collector.location}
                            >
                              {collector.location}
                            </span>
                          )}
                        </p>
                      )}
                      <div className="border-t border-border/40 pt-3 md:pt-5">
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
          disabled={!hasMultipleSets}
          aria-label="Next collector review"
          className="group relative flex size-8 items-center justify-center rounded-full border border-primary/35 bg-background/60 shadow-md backdrop-blur-md transition-all duration-300 enabled:hover:scale-105 enabled:hover:border-primary enabled:hover:bg-primary enabled:hover:text-primary-foreground active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 max-md:after:absolute max-md:after:-inset-1.5 md:size-12"
        >
          <ChevronRight
            className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={1.3}
          />
        </button>
      </div>

      {/* Bottom Quiet Reassurance */}
      <div className="mt-5 flex items-center justify-center gap-3 text-center md:mt-12">
        <Sparkles className="h-3 w-3 text-primary animate-soft-pulse" strokeWidth={1} />
        <p className="text-[9px] uppercase tracking-[.26em] text-primary">
          Every artwork is made once by hand · Preserving singular stories
        </p>
        <Sparkles className="h-3 w-3 text-primary animate-soft-pulse" strokeWidth={1} />
      </div>
    </section>
  );
}
