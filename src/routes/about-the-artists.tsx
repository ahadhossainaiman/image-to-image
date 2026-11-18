import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Flower2, Sparkles } from "lucide-react";
import angelDetail from "@/assets/angel-2.jpg";
import woodlandDetail from "@/assets/mushroom-2.jpg";

type Creator = {
  id: string;
  name: string;
  portrait: string | null;
  biography: string[];
  artwork: string;
  artworkAlt: string;
};

// Replace the sample biographies and artwork images with approved creator content.
const creators: Creator[] = [
  {
    id: "alba",
    name: "Alba",
    portrait: null,
    biography: [
      "Alba’s creative world begins with a fascination for the little things: the curve of a petal, the shimmer of a thread, and the quiet emotion a handmade object can hold. In this imagined introduction, nature and storytelling meet in a practice shaped by patience, curiosity, and a love of detail.",
      "Each creation is an invitation to pause and look a little closer. Through soft textures, delicate embellishments, and a sense of wonder, her work explores the connection between the things we treasure and the stories we carry with us.",
    ],
    artwork: angelDetail,
    artworkAlt: "Gold and ivory embroidery from the atelier",
  },
  {
    id: "zev-amore",
    name: "Zev Amore",
    portrait: null,
    biography: [
      "For Zev Amore, a creative idea is the beginning of a conversation between imagination, material, and feeling. This sample biography imagines an approach inspired by woodland shapes, unexpected textures, and the beauty of objects that reveal something new with every glance.",
      "Within the world of Thy House Of Art, that spirit becomes an exploration of character and atmosphere. Every thoughtful detail contributes to a larger story: one that welcomes a little magic into everyday spaces and leaves room for a collector’s own imagination.",
    ],
    artwork: woodlandDetail,
    artworkAlt: "Botanical embroidery on a woodland sculpture",
  },
];

export const Route = createFileRoute("/about-the-artists")({
  head: () => ({
    meta: [
      { title: "About The Artists — Thy House Of Art" },
      {
        name: "description",
        content: "Meet ALBA and ZEV AMORE, the creators behind Thy House Of Art.",
      },
      { property: "og:title", content: "About The Artists — Thy House Of Art" },
      { property: "og:description", content: "Discover the creators behind Thy House Of Art." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutTheArtists,
});

function AboutTheArtists() {
  return (
    <div className="overflow-hidden">
      <header className="relative mx-auto max-w-[1400px] px-5 pb-14 pt-16 sm:px-10 lg:pb-20 lg:pt-24">
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
              About us · The creators
            </p>
            <h1 className="max-w-4xl text-6xl leading-[.94] sm:text-8xl lg:text-[7.5rem]">
              Behind the art,
              <br />
              <em className="text-accent">a human story.</em>
            </h1>
          </div>
          <p className="max-w-sm border-l border-primary/35 pl-6 text-sm leading-7 text-muted-foreground lg:mb-2">
            A closer introduction to Alba and Zev Amore, the people behind the world of Thy House Of
            Art.
          </p>
        </div>
        <nav
          aria-label="Meet the creators"
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
          <span className="ml-auto hidden self-center text-[9px] uppercase tracking-[.24em] text-muted-foreground sm:block">
            Two names. One house of art.
          </span>
        </nav>
      </header>

      <div className="mx-auto max-w-[1400px] space-y-20 px-5 sm:space-y-28 sm:px-10 lg:space-y-36">
        {creators.map((creator, index) => (
          <article
            id={creator.id}
            aria-labelledby={`${creator.id}-name`}
            key={creator.id}
            className="scroll-mt-28 grid items-center gap-0 lg:grid-cols-2"
          >
            <figure
              className={`relative z-10 px-4 pb-0 pt-4 sm:px-8 sm:pt-8 lg:pb-8 ${index % 2 === 1 ? "lg:order-2" : ""}`}
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-14 top-0 border border-primary/30 lg:bottom-0"
              />
              <div className="group relative isolate aspect-[4/5] overflow-hidden rounded-t-[45%] bg-forest">
                <img
                  src={creator.portrait || creator.artwork}
                  alt={creator.portrait ? `Portrait of ${creator.name}` : creator.artworkAlt}
                  loading="lazy"
                  className={`h-full w-full object-cover transition-transform duration-1000 motion-safe:group-hover:scale-105 ${creator.portrait ? "" : "opacity-60"}`}
                />
                {!creator.portrait && (
                  <>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-forest via-forest/10 to-forest/10"
                    />
                    <div className="absolute inset-x-0 bottom-8 text-center">
                      <span className="text-[9px] uppercase tracking-[.25em] text-ivory/80">
                        Portrait forthcoming
                      </span>
                    </div>
                  </>
                )}
              </div>
              <figcaption className="relative flex items-center justify-between gap-4 py-5 text-[8px] uppercase tracking-[.2em] text-muted-foreground sm:text-[9px]">
                <span>{creator.portrait ? "The creator" : "A detail from our world"}</span>
                <span className="text-primary">Thy House Of Art / 0{index + 1}</span>
              </figcaption>
            </figure>

            <div
              className={`relative border border-primary/25 bg-secondary px-7 py-10 text-foreground shadow-[0_24px_70px_-36px_rgba(0,0,0,0.5)] sm:p-12 lg:py-16 ${index % 2 === 1 ? "lg:order-1 lg:-mr-5 lg:pr-16" : "lg:-ml-5 lg:pl-16"}`}
            >
              <div className="flex items-center justify-between border-b border-primary/20 pb-5">
                <p className="text-[9px] uppercase tracking-[.25em] text-primary">
                  Meet the creator
                </p>
                <span className="font-display text-3xl italic text-primary/65">0{index + 1}</span>
              </div>
              <h2
                id={`${creator.id}-name`}
                className="mt-8 text-6xl leading-[.95] sm:text-7xl lg:text-8xl"
              >
                {creator.name}
              </h2>
              <div aria-hidden="true" className="my-7 flex items-center gap-3">
                <span className="h-px w-12 bg-primary/40" />
                <Sparkles className="h-4 w-4 text-primary" strokeWidth={1} />
              </div>
              {creator.biography.length > 0 ? (
                <div className="space-y-5 text-sm leading-8 text-foreground/80">
                  <p className="text-[9px] uppercase tracking-[.2em] text-primary/80">
                    Sample biography
                  </p>
                  {creator.biography.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <div className="max-w-sm">
                  <p className="font-display text-3xl italic leading-snug">
                    A personal story,
                    <br />
                    in their own words.
                  </p>
                  <p className="mt-6 text-xs leading-7 text-muted-foreground">
                    Biography forthcoming.
                  </p>
                </div>
              )}
              <p
                aria-hidden="true"
                className="mt-10 border-t border-primary/20 pt-5 font-display text-3xl italic text-accent/80"
              >
                {creator.name}
              </p>
            </div>
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
