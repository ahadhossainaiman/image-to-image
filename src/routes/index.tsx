import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ArrowUpRight, Feather, Gem, Leaf, Sparkles } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import forestHero from "@/assets/enchanted-forest-hero.jpg";
import angelDetail from "@/assets/angel-2.jpg";
import { getArtworks, getCategories, getCollectorReviews } from "@/lib/wix";
import { ArtCard } from "@/components/ArtCard";
import { InquiryDialog } from "@/components/InquiryDialog";
import { CertificateStatement } from "@/components/CertificateStatement";
import { CollectorReviewsSection } from "@/components/CollectorReviewsSection";
import { CollectionImage } from "@/components/CollectionImage";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [allArtworks, allCategories, reviews] = await Promise.all([
      getArtworks(),
      getCategories(),
      getCollectorReviews(),
    ]);
    return {
      selectedWorks: allArtworks.slice(0, 3),
      categories: allCategories,
      reviews,
    };
  },
  head: () => ({ meta: [
    { title: "Thy House Of Art — Where Angels & Fairies Live" },
    { name: "description", content: "Discover singular handmade angel, fairy and embroidered merino wool sculptures in an enchanted luxury art atelier." },
    { property: "og:title", content: "Thy House Of Art — Where Angels & Fairies Live" },
    { property: "og:description", content: "One-of-a-kind handmade works where art, magic and artistry converge." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  const { selectedWorks, categories, reviews } = Route.useLoaderData();
  const taglineRowRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const row = taglineRowRef.current;
    const tagline = taglineRef.current;
    if (!row || !tagline) return;

    const fitTagline = () => {
      const targetWidth = row.getBoundingClientRect().width;
      const textWidth = tagline.getBoundingClientRect().width;
      if (!targetWidth || !textWidth || Math.abs(targetWidth - textWidth) < 0.5) return;

      const fontSize = Number.parseFloat(getComputedStyle(tagline).fontSize);
      tagline.style.fontSize = `${fontSize * (targetWidth / textWidth)}px`;
    };

    fitTagline();
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fitTagline);
    });
    observer.observe(row);
    observer.observe(tagline);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <section className="relative flex min-h-[90svh] sm:min-h-[92svh] lg:min-h-[calc(100svh-5.5rem)] items-center overflow-hidden">
        <img
          src={forestHero}
          alt="Handmade fairy sculpture in a sunlit enchanted forest beside an ancient cobblestone path"
          width={1920}
          height={1280}
          fetchPriority="high"
          className="hero-image absolute inset-0 h-full w-full select-none pointer-events-none"
        />
        <div className="hero-vignette absolute inset-0" />
        <div className="relative mx-auto w-full max-w-[1600px] px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <div className="glass-panel mx-auto grid w-full max-w-xl grid-cols-[fit-content(100%)_minmax(0,1fr)] p-6 sm:p-10 lg:mx-0 lg:ml-[2vw] xl:ml-[4vw] lg:max-w-xl xl:max-w-2xl lg:p-14">
            <div className="botanical-rule eyebrow max-sm:gap-2 max-sm:before:w-4 max-sm:after:w-4 max-[25rem]:tracking-[.12em] max-[22.5rem]:gap-1 max-[22.5rem]:tracking-[.08em] max-[22.5rem]:before:w-2 max-[22.5rem]:after:w-2">
              An enchanted fine art atelier
            </div>
            <h1 className="col-span-2 mt-6 text-[2.75rem] leading-[.9] tracking-[-.025em] sm:text-7xl md:text-8xl lg:text-[6.2rem] xl:text-[6.8rem]">
              Thy House<br /><em className="font-normal text-accent">Of Art</em>
            </h1>
            <div ref={taglineRowRef} className="mt-5 [contain:inline-size] sm:mt-6">
              <p ref={taglineRef} className="eyebrow w-max text-[.72rem] tracking-[.08em] whitespace-nowrap sm:text-sm">
                DISCOVER THE BEAUTY WITHIN™
              </p>
            </div>
            <p className="col-span-2 mt-4 font-display text-xl italic leading-snug text-foreground sm:mt-5 sm:text-2xl lg:text-3xl">
              Where Art, Magic & Artistry Converge
            </p>
            <p className="col-span-2 mt-3 max-w-md text-xs leading-6 text-muted-foreground sm:mt-4 sm:text-sm sm:leading-7">
              One-of-a-kind handmade creations, shaped slowly and finished with wonder. Each work is an invitation into a world that exists only once.
            </p>
            <div className="col-span-2 mt-8 flex flex-col gap-3.5 sm:mt-9 sm:flex-row sm:items-center sm:gap-4">
              <Link to="/shop" className="btn-art justify-center">
                Explore the gallery <ArrowRight className="h-4 w-4" strokeWidth={1.2} />
              </Link>
              <InquiryDialog>
                <button className="btn-outline-art justify-center">Bespoke inquiry</button>
              </InquiryDialog>
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

      <section id="collections" className="relative mx-auto max-w-[1500px] scroll-mt-24 px-5 py-24 sm:px-10 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="botanical-rule mx-auto w-fit eyebrow">The collections</div>
          <h2 className="mt-6 text-5xl leading-[1.02] sm:text-6xl">Step into our <em className="text-accent">enchanted worlds</em></h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-muted-foreground">From celestial couture to embroidered woodland forms, every collection begins with a story and ends with an object unlike any other.</p>
        </div>
        <div className="mt-16 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => category.published ? (
            <Link key={category.slug} to="/collections/$slug" params={{ slug: category.slug }} className="group block min-w-0">
              <div className="glass-panel art-frame aspect-[4/5] p-3 transition-transform duration-500 group-hover:-translate-y-2 group-hover:border-primary/60">
                <div className="absolute inset-3 overflow-hidden bg-muted">
                  {category.image && <CollectionImage key={category.image} src={category.image} alt={category.name} />}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
                  <span className="absolute left-5 top-5 text-[9px] tracking-[.25em] text-accent">0{index + 1}</span>
                  <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                    <h3 className="max-w-xs text-3xl leading-[1.05]">{category.shortName}</h3>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background/25 backdrop-blur-md transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><ArrowUpRight className="h-4 w-4" strokeWidth={1.1} /></span>
                  </div>
                </div>
              </div>
              <p className="mt-5 max-w-sm text-xs leading-6 text-muted-foreground">{category.description}</p>
            </Link>
          ) : (
            <div key={category.slug} className="group block" aria-label="A future collection is being prepared">
              <div className="glass-panel relative flex aspect-[4/5] flex-col items-center justify-center overflow-hidden p-8 text-center">
                <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />
                <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/5" />
                <span className="absolute left-6 top-6 text-[9px] tracking-[.25em] text-primary">0{index + 1}</span>
                <Sparkles className="h-6 w-6 text-primary" strokeWidth={.8} />
                <p className="eyebrow mt-7">In the atelier</p>
                <h3 className="mt-4 text-3xl text-muted-foreground">A new story is<br />taking shape</h3>
              </div>
              <p className="mt-5 text-xs leading-6 text-muted-foreground">A future body of work, quietly being imagined by hand.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-10 sm:px-10 lg:py-20">
        <div className="glass-panel relative mx-auto grid max-w-[1400px] overflow-hidden lg:grid-cols-[.85fr_1.15fr]">
          <div className="relative min-h-[430px] overflow-hidden lg:min-h-[650px]">
            <img src={angelDetail} alt="Intricate hand-beaded celestial wing in gold and pearl" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/65 via-transparent to-transparent" />
            <p className="absolute bottom-7 left-7 max-w-xs font-display text-2xl italic">“The smallest stitch can hold an entire world.”</p>
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-14 lg:p-20">
            <p className="eyebrow">Our artistic philosophy</p>
            <h2 className="mt-6 text-5xl leading-[1.02] sm:text-6xl">Made slowly.<br /><em className="text-accent">Felt forever.</em></h2>
            <p className="mt-7 max-w-lg text-sm leading-7 text-muted-foreground">We believe the true luxury of an artwork lies in its singularity: the trace of the hand, the hours held within it, and the emotional world it opens for its collector.</p>
            <div className="mt-10 grid gap-7 sm:grid-cols-3">
              {[
                { icon: Feather, title: "By hand", text: "Shaped, stitched and finished individually." },
                { icon: Gem, title: "Only once", text: "No editions. No repetitions. Ever." },
                { icon: Leaf, title: "With wonder", text: "Narratives inspired by the natural and celestial." },
              ].map((value) => (
                <div key={value.title}>
                  <value.icon className="h-5 w-5 text-primary" strokeWidth={1} />
                  <h3 className="mt-4 text-2xl">{value.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">{value.text}</p>
                </div>
              ))}
            </div>
            <Link to="/atelier-story" className="mt-10 flex w-fit items-center gap-3 text-[10px] uppercase tracking-[.2em] text-primary hover:text-accent">Discover the atelier <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-10 lg:py-32">
        <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow">Selected works</p><h2 className="mt-4 text-5xl sm:text-6xl">From the atelier</h2><CertificateStatement className="mt-5 max-w-xl" /></div>
          <Link to="/shop" className="flex w-fit items-center gap-3 text-[10px] uppercase tracking-[.2em] text-primary hover:text-accent">View all works <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-14 grid gap-x-10 gap-y-16 md:grid-cols-2">
          {selectedWorks.map((artwork, index) => <ArtCard key={artwork.slug} a={artwork} className={index === 1 ? "md:mt-24" : ""} />)}
        </div>
      </section>

      {/* Collector Reflections & Reviews */}
      <CollectorReviewsSection reviews={reviews} />

      <section className="px-5 pb-20 sm:px-10">
        <div className="glass-panel mx-auto max-w-[1400px] px-7 py-20 text-center sm:px-12 lg:py-28">
          <Sparkles className="mx-auto h-6 w-6 text-primary" strokeWidth={.9} />
          <p className="eyebrow mt-7">A work of your own</p>
          <h2 className="mx-auto mt-5 max-w-3xl text-5xl leading-[1.02] sm:text-6xl">Some stories are waiting<br /><em className="text-accent">to be made.</em></h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-muted-foreground">Commission a bespoke work exclusively designed and created for you, a meaningful person or occasion, or for your private collection. We will contact you and set up a 15-minute, no-obligation discussion about your vision.</p>
          <InquiryDialog><button className="btn-art mt-9">Begin a bespoke inquiry <ArrowRight className="h-4 w-4" /></button></InquiryDialog>
        </div>
      </section>
    </>
  );
}
