import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Flower2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { getPageHead } from "@/lib/seo";

type Creator = {
  id: string;
  name: string;
  biography: ReactNode;
  sampleBiography?: boolean;
  closingLine?: string;
  image: string;
  imageAlt: string;
  imageCaption: string;
};

const creators: Creator[] = [
  {
    id: "alba",
    name: "Alba Amóre",
    biography: (
      <>
        <p>
          Alba has always cherished the art of bringing people together. Whether celebrating holidays,
          birthdays, school achievements, or life's special milestones, she delights in creating
          memorable experiences filled with love, thoughtful details, handmade decorations, and
          beautifully curated tables. She affectionately calls these occasions her{" "}
          <em>Celebrations of Love &amp; Life</em>, where every glass is filled with Martinelli's
          sparkling apple cider and every moment becomes a cherished memory.
        </p>
        <p>
          Birthdays were especially magical. When the children were young, Alba and her husband, Zev,
          would stay up until the early morning hours transforming their home into elaborate, fully
          themed wonderlands. The children's astonishment and excitement the following morning made
          every late night worthwhile. For Alba, there was something extraordinary about creating
          moments of surprise, wonder, and lasting happiness.
        </p>
        <p>
          As the children grew and began making homes of their own, Alba found new ways to express
          her creativity. She began designing and handcrafting personal treasures for family and
          friends, including heirloom dolls, fairies, needle-felted creations, sculpted characters,
          jewelry, and meaningful gifts for life's milestones. Before long, others began requesting
          her creations, lovingly treasuring them as keepsakes and heirlooms. Her home became
          affectionately known as the house of art, inspiring the name <strong>Thy House of Art</strong>.
        </p>
        <p>
          A woman of many talents and an ever-evolving imagination, Alba is a true Renaissance
          spirit, continually exploring new artistic disciplines and discovering fresh ways to bring
          her visions to life.
        </p>
        <p>
          With an artist's eye, a golden heart, and enlightened hands, she draws inspiration from
          nature's colors, the delicate beauty of flowers, the textures of the earth, and the
          countless wonders of everything created by our Maker above.
        </p>
        <p>
          Every creation reflects her love of beauty, imagination, and the joy of making something
          meaningful.
        </p>
        <p>Her guiding inspiration remains:</p>
      </>
    ),
    closingLine: "Discover The Beauty Within™",
    image: "/ALBA-IN-THE-MIRROR.png",
    imageAlt: "Alba Amóre beside her reflection in a textured mirror",
    imageCaption: "The creator",
  },
  {
    id: "zev-amore",
    name: "Zev Amóre",
    biography: (
      <>
        <p>
          For Zev Amóre, a creative idea is the beginning of a conversation between imagination,
          material, and feeling. This biography imagines an approach inspired by woodland
          shapes, unexpected textures, and the beauty of objects that reveal something new with every
          glance.
        </p>
        <p>
          Within the world of Thy House Of Art, that spirit becomes an exploration of character and
          atmosphere. Every thoughtful detail contributes to a larger story: one that welcomes a
          little magic into everyday spaces and leaves room for a collector’s own imagination.
        </p>
      </>
    ),
    sampleBiography: true,
    image: "/Zev%20_%20Alba.jpg",
    imageAlt: "Zev and Alba Amóre smiling together",
    imageCaption: "Zev & Alba Amóre",
  },
];

export const Route = createFileRoute("/about-the-artists")({
  head: () => getPageHead("/about-the-artists"),
  component: AboutTheArtists,
});

function AboutTheArtists() {
  return (
    <div className="overflow-x-clip">
      <header className="relative mx-auto max-w-[1600px] px-4 pt-8 pb-5 sm:px-10 md:pt-16 md:pb-14 lg:px-8 lg:pb-20 lg:pt-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 top-6 h-96 w-96 rounded-full border border-primary/10 sm:right-0"
        >
          <div className="absolute inset-9 rounded-full border border-primary/10" />
          <Flower2
            className="absolute inset-0 m-auto h-36 w-36 text-primary/10"
            strokeWidth={0.5}
          />
        </div>
        <p className="eyebrow flex items-center gap-4 text-[14px] max-[360px]:gap-2">
          <span className="h-px w-10 bg-primary/50 max-[360px]:w-7" />
          Discover the beauty within™
        </p>
        <div className="relative mt-4 grid items-end gap-3 md:mt-9 md:gap-9 lg:grid-cols-[1.4fr_.6fr]">
          <div>
            <p className="mb-2 text-[14px] md:mb-4 uppercase tracking-[.3em] text-muted-foreground">
              About the artists
            </p>
            <h1 className="max-w-4xl text-[clamp(2.5rem,9vw,3.75rem)] leading-[.94] sm:text-8xl lg:text-[7.5rem]">
              Behind the art,
              <br />
              <em className="text-accent">a human story.</em>
            </h1>
          </div>
          <p className="max-w-sm border-l border-primary/35 pl-3 text-sm leading-relaxed md:pl-6 md:leading-7 text-muted-foreground lg:mb-2">
            An intimate introduction to Alba and Zev Amóre, the artists behind the world of Thy
            House Of Art.
          </p>
        </div>
        <nav
          aria-label="Meet the artists"
          className="relative mt-5 flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-3 md:mt-16 md:gap-x-10 md:gap-y-5 md:py-5"
        >
          {creators.map((creator, index) => (
            <a
              key={creator.id}
              href={`#${creator.id}`}
              className="group flex min-h-8 items-center gap-2 text-xs md:min-h-0 md:gap-4 text-foreground transition-colors hover:text-accent"
            >
              <span className="text-[9px] tracking-widest text-primary">0{index + 1}</span>
              <span className="tracking-[.16em] uppercase">{creator.name}</span>
              <ArrowDown
                aria-hidden="true"
                className="h-3 w-3 text-primary transition-transform group-hover:translate-y-1 motion-reduce:transform-none"
                strokeWidth={1.2}
              />
            </a>
          ))}
          <span className="basis-full self-center text-[9px] uppercase tracking-[.24em] text-muted-foreground md:ml-auto md:basis-auto">
            Two hearts as one created Thy House Of Art
          </span>
        </nav>
      </header>

      <div className="@container mx-auto max-w-[1600px] space-y-6 px-4 sm:px-10 md:space-y-28 lg:space-y-36 lg:px-8">
        {creators.map((creator, index) => (
          <article
            id={creator.id}
            aria-labelledby={`${creator.id}-name`}
            key={creator.id}
            className="grid scroll-mt-20 gap-0 sm:scroll-mt-28 lg:grid-cols-[minmax(0,1fr)_var(--portrait-width)] lg:[--portrait-width:56.5cqw] lg:[--portrait-height:min(calc((var(--portrait-width)_-_4rem)*966/1287),max(20rem,calc(100svh_-_15.5rem)))]"
          >
            {/* The extra height accounts for the figure frame, caption, and sticky scroll travel. */}
            <div className="relative border border-primary/25 bg-secondary px-4 py-5 text-foreground shadow-[0_24px_70px_-36px_rgba(0,0,0,0.5)] sm:p-7 md:p-12 lg:-mr-3 lg:min-h-[calc(var(--portrait-height)_+_11rem)] lg:py-16 lg:pr-16">
              <div className="flex items-center justify-between border-b border-primary/20 pb-3 md:pb-5">
                <p className="text-[14px] uppercase tracking-[.25em] text-primary">
                  Meet the artist
                </p>
                <span className="font-display text-3xl italic text-primary/65">0{index + 1}</span>
              </div>
              <h2
                id={`${creator.id}-name`}
                className="mt-4 text-4xl md:mt-8 leading-[.95] sm:text-7xl xl:text-8xl"
              >
                {creator.name}
              </h2>
              <div aria-hidden="true" className="my-3 flex items-center md:my-7 gap-3">
                <span className="h-px w-12 bg-primary/40" />
                <Sparkles className="h-4 w-4 text-primary" strokeWidth={1} />
              </div>
              <div className="space-y-3 text-sm leading-relaxed md:space-y-5 md:leading-8 text-foreground/80">
                <p className="text-[14px] uppercase tracking-[.2em] text-primary/80">
                  {creator.sampleBiography ? "Biography" : "Biography"}
                </p>
                {creator.biography}
              </div>
              <p
                aria-hidden={!creator.closingLine}
                className="mt-5 border-t border-primary/20 pt-3 font-display text-2xl md:mt-10 md:pt-5 md:text-3xl italic text-accent/80"
              >
                {creator.closingLine ?? creator.name}
              </p>
              {/* Insert Alba's signature below her closing line when Zev provides it. */}
            </div>

            <figure className="relative z-10 p-2 pb-0 max-lg:order-first md:px-8 md:pt-8 lg:sticky lg:top-28 lg:self-start lg:pb-8">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 top-0 md:bottom-14 border border-primary/30 lg:bottom-0"
              />
              <div className="relative isolate aspect-[1287/966] w-full overflow-hidden rounded-t-[45%] bg-forest lg:max-h-[var(--portrait-height)]">
                <img
                  src={creator.image}
                  alt={creator.imageAlt}
                  loading="lazy"
                  className="h-full w-full object-contain opacity-60"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-forest via-forest/10 to-forest/10"
                />
              </div>
              <figcaption className="relative flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3 text-[14px] uppercase tracking-[.2em] text-muted-foreground md:py-5">
                <span>{creator.imageCaption}</span>
                <span className="text-primary">Thy House Of Art / 0{index + 1}</span>
              </figcaption>
            </figure>
          </article>
        ))}
      </div>

      <section className="mx-auto mt-6 max-w-[1400px] px-4 text-center sm:px-10 md:mt-32">
        <div className="border-y border-border px-3 py-6 md:px-4 md:py-16">
          <Flower2 aria-hidden="true" className="mx-auto h-8 w-8 text-primary" strokeWidth={0.8} />
          <p className="eyebrow mt-3 text-[14px] md:mt-6">From our world to yours</p>
          <h2 className="mt-3 text-3xl sm:text-6xl md:mt-5">
            The story continues
            <br />
            <em className="text-accent">in every creation.</em>
          </h2>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 md:mt-8 md:gap-10">
            <Link to="/shop" className="btn-art text-[13px]">
              Explore the collection{" "}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.2} />
            </Link>
            <Link
              to="/atelier-story"
              className="flex items-center gap-3 border-b border-primary/40 py-2 text-[13px] uppercase tracking-[.16em] text-primary transition-colors hover:text-accent"
            >
              Our atelier story{" "}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.2} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
