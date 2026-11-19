import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Flower2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import woodlandDetail from "@/assets/mushroom-2.jpg";

type Creator = {
  id: string;
  name: string;
  biography: ReactNode;
  sampleBiography?: boolean;
  closingLine?: string;
  image: string;
  imageAlt: string;
  portrait?: boolean;
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
    portrait: true,
  },
  {
    id: "zev-amore",
    name: "Zev Amóre",
    biography: (
      <>
        <p>
          For Zev Amóre, a creative idea is the beginning of a conversation between imagination,
          material, and feeling. This sample biography imagines an approach inspired by woodland
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
    image: woodlandDetail,
    imageAlt: "Botanical embroidery on a woodland sculpture",
  },
];

export const Route = createFileRoute("/about-the-artists")({
  head: () => ({
    meta: [
      { title: "About The Artists — Thy House Of Art" },
      {
        name: "description",
        content: "Meet Alba Amóre and Zev Amóre, the artists behind Thy House Of Art.",
      },
      { property: "og:title", content: "About The Artists — Thy House Of Art" },
      { property: "og:description", content: "Discover the artists behind Thy House Of Art." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutTheArtists,
});

function AboutTheArtists() {
  return (
    <div className="overflow-x-clip">
      <header className="relative mx-auto max-w-[1600px] px-5 pb-14 pt-16 sm:px-10 lg:px-8 lg:pb-20 lg:pt-24">
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
        <p className="eyebrow flex items-center gap-4 max-[360px]:gap-2">
          <span className="h-px w-10 bg-primary/50 max-[360px]:w-7" />
          Discover the beauty within™
        </p>
        <div className="relative mt-9 grid items-end gap-9 lg:grid-cols-[1.4fr_.6fr]">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[.3em] text-muted-foreground">
              About the artists
            </p>
            <h1 className="max-w-4xl text-6xl leading-[.94] sm:text-8xl lg:text-[7.5rem]">
              Behind the art,
              <br />
              <em className="text-accent">a human story.</em>
            </h1>
          </div>
          <p className="max-w-sm border-l border-primary/35 pl-6 text-sm leading-7 text-muted-foreground lg:mb-2">
            An intimate introduction to Alba and Zev Amóre, the artists behind the world of Thy
            House Of Art.
          </p>
        </div>
        <nav
          aria-label="Meet the artists"
          className="relative mt-12 flex flex-wrap gap-x-10 gap-y-5 border-y border-border py-5 sm:mt-16"
        >
          {creators.map((creator, index) => (
            <a
              key={creator.id}
              href={`#${creator.id}`}
              className="group flex items-center gap-4 text-xs text-foreground transition-colors hover:text-accent"
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
          <span className="basis-full self-center text-[9px] uppercase tracking-[.24em] text-muted-foreground sm:ml-auto sm:basis-auto">
            Two hearts as one created Thy House Of Art
          </span>
        </nav>
      </header>

      <div className="@container mx-auto max-w-[1600px] space-y-20 px-5 sm:space-y-28 sm:px-10 lg:space-y-36 lg:px-8">
        {creators.map((creator, index) => (
          <article
            id={creator.id}
            aria-labelledby={`${creator.id}-name`}
            key={creator.id}
            className="scroll-mt-28 grid gap-0 lg:grid-cols-[minmax(0,1fr)_var(--portrait-width)] lg:[--portrait-width:56.5cqw] lg:[--portrait-height:min(calc((var(--portrait-width)_-_4rem)*966/1287),max(20rem,calc(100svh_-_15.5rem)))]"
          >
            {/* The extra height accounts for the figure frame, caption, and sticky scroll travel. */}
            <div className="relative border border-primary/25 bg-secondary px-7 py-10 text-foreground shadow-[0_24px_70px_-36px_rgba(0,0,0,0.5)] sm:p-12 lg:-mr-3 lg:min-h-[calc(var(--portrait-height)_+_11rem)] lg:py-16 lg:pr-16">
              <div className="flex items-center justify-between border-b border-primary/20 pb-5">
                <p className="text-[9px] uppercase tracking-[.25em] text-primary">
                  Meet the artist
                </p>
                <span className="font-display text-3xl italic text-primary/65">0{index + 1}</span>
              </div>
              <h2
                id={`${creator.id}-name`}
                className="mt-8 text-6xl leading-[.95] sm:text-7xl xl:text-8xl"
              >
                {creator.name}
              </h2>
              <div aria-hidden="true" className="my-7 flex items-center gap-3">
                <span className="h-px w-12 bg-primary/40" />
                <Sparkles className="h-4 w-4 text-primary" strokeWidth={1} />
              </div>
              <div className="space-y-5 text-sm leading-8 text-foreground/80">
                <p className="text-[9px] uppercase tracking-[.2em] text-primary/80">
                  {creator.sampleBiography ? "Sample biography" : "Biography"}
                </p>
                {creator.biography}
              </div>
              <p
                aria-hidden={!creator.closingLine}
                className="mt-10 border-t border-primary/20 pt-5 font-display text-3xl italic text-accent/80"
              >
                {creator.closingLine ?? creator.name}
              </p>
              {/* Insert Alba's signature below her closing line when Zev provides it. */}
            </div>

            <figure className="relative z-10 px-4 pb-0 pt-4 sm:px-8 sm:pt-8 lg:sticky lg:top-28 lg:self-start lg:pb-8">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-14 top-0 border border-primary/30 lg:bottom-0"
              />
              <div className="relative isolate aspect-[1287/966] w-full overflow-hidden rounded-t-[45%] bg-forest lg:max-h-[var(--portrait-height)]">
                <img
                  src={creator.image}
                  alt={creator.imageAlt}
                  loading="lazy"
                  className={`h-full w-full opacity-60 ${creator.portrait ? "object-contain" : "object-cover"}`}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-forest via-forest/10 to-forest/10"
                />
                {!creator.portrait && (
                  <div className="absolute inset-x-0 bottom-8 text-center">
                    <span className="text-[9px] uppercase tracking-[.25em] text-ivory/80">
                      Portrait forthcoming
                    </span>
                  </div>
                )}
              </div>
              <figcaption className="relative flex items-center justify-between gap-4 py-5 text-[8px] uppercase tracking-[.2em] text-muted-foreground sm:text-[9px]">
                <span>{creator.portrait ? "The creator" : "A detail from our world"}</span>
                <span className="text-primary">Thy House Of Art / 0{index + 1}</span>
              </figcaption>
            </figure>
          </article>
        ))}
      </div>

      <section className="mx-auto mt-24 max-w-[1400px] px-5 text-center sm:mt-32 sm:px-10">
        <div className="border-y border-border px-4 py-12 sm:py-16">
          <Flower2 aria-hidden="true" className="mx-auto h-8 w-8 text-primary" strokeWidth={0.8} />
          <p className="eyebrow mt-6">From our world to yours</p>
          <h2 className="mt-5 text-4xl sm:text-6xl">
            The story continues
            <br />
            <em className="text-accent">in every creation.</em>
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
            <Link to="/shop" className="btn-art">
              Explore the collection{" "}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.2} />
            </Link>
            <Link
              to="/atelier-story"
              className="flex items-center gap-3 border-b border-primary/40 py-2 text-[10px] uppercase tracking-[.16em] text-primary transition-colors hover:text-accent"
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
