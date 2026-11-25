import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ArrowUpRight, Feather, Gem, Leaf, Sparkles } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import forestHero from "@/assets/enchanted-forest-hero.jpg";
import angelDetail from "@/assets/angel-2.jpg";
import { getCategories, getCollectorReviews } from "@/lib/wix";
import { CertificateStatement } from "@/components/CertificateStatement";
import { CollectorReviewsSection } from "@/components/CollectorReviewsSection";
import { CollectionImage } from "@/components/CollectionImage";
import { getPageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [categories, reviews] = await Promise.all([
      getCategories(),
      getCollectorReviews(),
    ]);
    return { categories, reviews };
  },
  head: () => getPageHead("/"),
  component: Index,
});

function Index() {
  const { categories, reviews } = Route.useLoaderData();
  const taglineRowRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const row = taglineRowRef.current;
    const tagline = taglineRef.current;
    const subtitle = subtitleRef.current;
    const subtitleRow = subtitle?.parentElement;
    if (!row || !tagline || !subtitle || !subtitleRow) return;

    const compactLayout = window.matchMedia("(width < 64rem)");

    const fitTagline = () => {
      const targetWidth = row.getBoundingClientRect().width;
      const textWidth = tagline.getBoundingClientRect().width;
      if (!targetWidth || !textWidth || Math.abs(targetWidth - textWidth) < 0.5) return;

      const fontSize = Number.parseFloat(getComputedStyle(tagline).fontSize);
      tagline.style.setProperty("--home-tagline-size", `${fontSize * (targetWidth / textWidth)}px`);
    };

    const fitHeroText = () => {
      if (!compactLayout.matches) {
        fitTagline();
        return;
      }

      const availableWidth = subtitleRow.getBoundingClientRect().width - 1;
      const textWidth = subtitle.getBoundingClientRect().width;
      if (!availableWidth || !textWidth) return;

      const preferredSize = Number.parseFloat(getComputedStyle(subtitleRow).fontSize);
      const currentSize = Number.parseFloat(getComputedStyle(subtitle).fontSize);
      const nextSize = Math.min(preferredSize, (currentSize * availableWidth) / textWidth);
      if (textWidth <= availableWidth && Math.abs(nextSize - currentSize) < 0.05) return;

      subtitle.style.setProperty("--home-subtitle-size", `${nextSize}px`);
    };

    fitHeroText();
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fitHeroText);
    });
    observer.observe(row);
    observer.observe(tagline);
    observer.observe(subtitleRow);
    observer.observe(subtitle);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <section className="relative flex md:min-h-[92svh] lg:min-h-[calc(100svh-5.5rem)] items-center overflow-hidden">
        <img
          src={forestHero}
          alt="Handmade fairy sculpture in a sunlit enchanted forest beside an ancient cobblestone path"
          width={1920}
          height={1280}
          fetchPriority="high"
          className="hero-image absolute inset-0 h-full w-full select-none pointer-events-none"
        />
        <div className="hero-vignette absolute inset-0" />
        <div className="relative mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 md:py-16 lg:py-20">
          <div className="glass-panel mx-auto grid w-full max-w-xl grid-cols-[fit-content(100%)_minmax(0,1fr)] p-5 max-lg:@container max-lg:grid-cols-[minmax(0,1fr)_clamp(30%,19vw,36%)] sm:p-7 md:p-10 lg:mx-0 lg:ml-[2vw] xl:ml-[4vw] lg:max-w-xl xl:max-w-2xl lg:p-14">
            <div className="botanical-rule eyebrow max-lg:col-span-2 max-sm:gap-2 max-sm:before:w-4 max-sm:after:w-4 max-[25rem]:tracking-[.12em] max-[22.5rem]:gap-1 max-[22.5rem]:tracking-[.08em] max-[22.5rem]:before:w-2 max-[22.5rem]:after:w-2">
              An enchanted fine art atelier
            </div>
            <h1 className="col-span-2 mt-6 leading-[.9] tracking-[-.025em] max-lg:col-span-1 max-lg:text-[clamp(2rem,11.5vw,4.25rem)] max-lg:whitespace-nowrap lg:text-[6.2rem] xl:text-[6.8rem]">
              Thy House<br /><em className="font-normal text-accent">Of Art</em>
            </h1>
            <picture aria-hidden="true" className="pointer-events-none relative col-start-2 row-start-2 -mt-2 -mr-5 min-h-[min(18vw,11rem)] overflow-hidden select-none [mask-image:linear-gradient(to_bottom,black_68%,transparent)] sm:-mr-7 md:-mr-10 lg:hidden">
              <source media="(width < 64rem)" srcSet="/Golden_Fairy_with_Butterfly_Wings.png" />
              <img alt="" width={971} height={1620} className="absolute inset-x-0 top-0 h-auto w-full" />
            </picture>
            <div ref={taglineRowRef} className="mt-5 [contain:inline-size] max-lg:col-span-2 sm:mt-6">
              <p ref={taglineRef} className="eyebrow text-[.72rem] tracking-[.08em] whitespace-nowrap max-lg:leading-snug sm:text-sm lg:w-max lg:text-[length:var(--home-tagline-size,var(--text-sm))]">
                DISCOVER THE BEAUTY WITHIN™
              </p>
            </div>
            <p className="col-span-2 mt-4 font-display italic leading-snug text-foreground max-lg:text-[clamp(.9375rem,6.65cqw,1.75rem)] sm:mt-5 lg:text-3xl">
              <span ref={subtitleRef} className="max-lg:block max-lg:w-max max-lg:whitespace-nowrap max-lg:text-[length:var(--home-subtitle-size,inherit)]">
                Where Art, Magic & Artistry Converge
              </span>
            </p>
            <p className="col-span-2 mt-3 max-w-md text-xs leading-6 text-muted-foreground sm:mt-4 sm:text-sm sm:leading-7">
              One-of-a-kind handmade creations, shaped slowly and finished with wonder. Each work is an invitation into a world that exists only once.
            </p>
            <div className="col-span-2 mt-5 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:items-center sm:gap-4">
              <Link to="/shop" preload="intent" className="btn-art justify-center">
                Explore the gallery <ArrowRight className="h-4 w-4" strokeWidth={1.2} />
              </Link>
              <Link to="/contact" className="btn-outline-art justify-center">Bespoke inquiry</Link>
            </div>
          </div>
        </div>
        <a
          href="#collections"
          aria-label="Scroll to collections"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[8px] uppercase tracking-[.25em] text-muted-foreground md:flex"
        >
          Discover <ArrowDown className="h-4 w-4 animate-soft-pulse text-primary" strokeWidth={1} />
        </a>
      </section>

      <section id="collections" aria-labelledby="collections-heading" className="mx-auto max-w-[75rem] scroll-mt-20 px-4 py-9 sm:px-8 md:scroll-mt-24 md:py-16">
        <div className="mx-auto max-w-6xl text-center">
          <div className="botanical-rule mx-auto w-fit eyebrow max-sm:gap-2 max-sm:before:w-5 max-sm:after:w-5 lg:text-sm">The collections</div>
          <h2 id="collections-heading" className="mt-3 text-[clamp(2.375rem,6vw,5.25rem)] leading-[1.02] text-balance sm:mt-4">Step into our <em className="text-accent">enchanted worlds</em></h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed sm:mt-6 sm:leading-7 text-muted-foreground">From celestial couture to embroidered woodland forms, every collection begins with a story and ends with an object unlike any other.</p>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-5 md:mt-9 lg:gap-6">
          {categories.map((category) => (
            <Link key={category.slug} to="/collections/$slug" params={{ slug: category.slug }} preload="intent" aria-labelledby={`collection-title-${category.slug}`} className="glass-panel group flex min-w-0 flex-col p-1.5 transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-primary sm:p-2">
              <div className="art-frame aspect-[4/3] sm:aspect-[3/2]">
                <div className="absolute inset-0 overflow-hidden">
                  {category.image && <CollectionImage key={category.image} src={category.image} alt={category.name} />}
                </div>
              </div>
              <div className="flex flex-1 flex-col px-1 pt-2 pb-1.5 sm:px-2 sm:pt-3 sm:pb-2">
                <div className="grid min-h-7 items-center gap-1.5 sm:flex sm:justify-between sm:gap-2">
                  <div className="@container min-w-0 flex-1">
                    <h3 id={`collection-title-${category.slug}`} className="text-[clamp(.875rem,8.5cqw,1.5rem)] leading-tight [overflow-wrap:anywhere]">{category.shortName}</h3>
                  </div>
                  <span className="grid size-5 shrink-0 place-items-center rounded-full border border-primary/40 transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:size-8"><ArrowUpRight className="size-3 sm:size-4" strokeWidth={1.1} aria-hidden="true" /></span>
                </div>
                {category.description && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:mt-2 lg:text-sm">{category.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 py-4 sm:px-10 md:py-10 lg:py-16">
        <div className="glass-panel relative mx-auto grid max-w-[1400px] overflow-hidden lg:grid-cols-[.85fr_1.15fr]">
          <div className="relative aspect-[4/3] overflow-hidden md:min-h-[430px] lg:aspect-auto lg:min-h-[650px]">
            <img src={angelDetail} alt="Intricate hand-beaded celestial wing in gold and pearl" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/65 via-transparent to-transparent" />
            <p className="absolute inset-x-4 bottom-4 max-w-xs font-display text-xl sm:bottom-7 sm:left-7 sm:text-2xl italic">“The smallest stitch can hold an entire world.”</p>
          </div>
          <div className="flex flex-col justify-center p-5 sm:p-10 md:p-14 lg:p-20">
            <p className="eyebrow">Our artistic philosophy</p>
            <h2 className="mt-3 text-4xl leading-[1.02] sm:mt-6 sm:text-6xl">Made slowly.<br /><em className="text-accent">Felt forever.</em></h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed sm:mt-7 sm:leading-7 text-muted-foreground">We believe the true luxury of an artwork lies in its singularity: the trace of the hand, the hours held within it, and the emotional world it opens for its collector.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3 md:mt-10 md:gap-7">
              {[
                { icon: Feather, title: "By hand", text: "Shaped, stitched and finished individually." },
                { icon: Gem, title: "Only once", text: "No editions. No repetitions. Ever." },
                { icon: Leaf, title: "With wonder", text: "Narratives inspired by the natural and celestial." },
              ].map((value) => (
                <div key={value.title} className="max-sm:grid max-sm:grid-cols-[auto_minmax(0,1fr)] max-sm:items-start max-sm:gap-x-3">
                  <value.icon className="max-sm:row-span-2 max-sm:mt-1 h-5 w-5 text-primary" strokeWidth={1} />
                  <h3 className="text-xl sm:mt-4 sm:text-2xl">{value.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed sm:mt-2 sm:leading-6 text-muted-foreground">{value.text}</p>
                </div>
              ))}
            </div>
            <Link to="/atelier-story" className="mt-5 flex w-fit items-center md:mt-10 gap-3 text-[10px] uppercase tracking-[.2em] text-primary hover:text-accent">Discover the atelier <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="selected-works-heading" className="mx-auto max-w-[1400px] px-4 py-6 sm:px-10 md:py-12">
        <div className="border border-primary bg-[image:var(--gradient-gold)] px-5 py-6 text-[oklch(0.34_0.076_80)] sm:px-9 sm:py-9 lg:px-14 lg:py-12">
          <div className="bg-forest px-4 py-7 text-center sm:px-8 sm:py-10">
            <h2 id="selected-works-heading" className="text-[clamp(3rem,7.5vw,6.5rem)] leading-[.92] text-accent">Atelier</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-foreground sm:mt-5 sm:leading-7">Every piece is shaped, stitched and finished individually. No moulded editions, no repeated works: only singular objects with their own presence, provenance and story.</p>
            <Link to="/shop" preload="intent" className="btn-art mt-6 min-h-12 text-sm tracking-wide sm:mt-8">
              View All Works <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <CertificateStatement className="mt-4 justify-center gap-2 text-center text-xs leading-5 font-semibold tracking-wide text-forest [&>svg]:text-current sm:mt-5 lg:items-center lg:text-[11px] lg:tracking-normal lg:whitespace-nowrap lg:[&>svg]:mt-0 xl:text-xs xl:tracking-wide" />
        </div>
      </section>

      {/* Collector Reflections & Reviews */}
      <CollectorReviewsSection reviews={reviews} />

      <section className="px-4 pb-3 sm:px-10 md:pb-20 lg:pb-12">
        <div className="glass-panel mx-auto max-w-[1400px] px-4 py-7 text-center sm:px-7 md:px-12 md:py-20 lg:py-28">
          <Sparkles className="mx-auto h-6 w-6 text-primary" strokeWidth={.9} />
          <p className="eyebrow mt-4 sm:mt-7">A work of your own</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-4xl leading-[1.02] sm:mt-5 sm:text-6xl">Some stories are waiting{" "}<br className="hidden sm:block" /><em className="text-accent">to be made.</em></h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed sm:mt-6 sm:leading-7 text-muted-foreground">Commission a bespoke work exclusively designed and created for you, a meaningful person or occasion, or for your private collection. We will contact you and set up a 15-minute, no-obligation discussion about your vision.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:mt-9">
            <Link to="/contact" className="btn-art">Begin a bespoke inquiry <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/contact" className="btn-outline-art">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
