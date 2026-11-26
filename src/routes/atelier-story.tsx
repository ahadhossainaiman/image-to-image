import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Feather, Gem, Heart, Sparkles } from "lucide-react";
import angel2 from "@/assets/angel-2.jpg";
import forestHero from "@/assets/enchanted-forest-hero.jpg";
import { getPageHead } from "@/lib/seo";

export const Route = createFileRoute("/atelier-story")({
  head: () => getPageHead("/atelier-story"),
  component: AtelierStory,
});

function AtelierStory() {
  return (
    <>
      <section className="mx-auto grid max-w-[1400px] items-start gap-5 px-4 pt-8 pb-4 sm:px-10 md:gap-14 md:py-16 lg:grid-cols-[1fr_.9fr] lg:py-24">
        <div>
          <p className="eyebrow text-[14px]">The atelier story</p>
          <h1 className="mt-3 text-5xl md:mt-6 leading-[.95] sm:text-7xl lg:text-8xl">A house of<br /><em className="text-accent">wonder.</em></h1>
          <p className="mt-4 max-w-xl font-display text-xl md:mt-8 md:text-2xl italic leading-snug text-foreground"> Atelier (pronounced <em>ah-tell-YAY</em>) is a French word meaning a creative workspace or studio where designers and artisans imagine, develop, and bring beautiful, distinctive things to life.</p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed md:mt-10 md:leading-7 text-muted-foreground">Thy House Of Art is an independent art studio devoted to one-of-a-kind handmade creations. Our world brings together celestial figures, botanical imagination and the meditative artistry of embroidery.</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed md:mt-4 md:leading-7 text-muted-foreground">Every piece is shaped, stitched and finished individually. No moulded editions, no repeated works: only singular objects with their own presence, provenance and story.</p>
        </div>
        <div className="glass-panel relative p-2 md:p-3">
          <img src={angel2} alt="Hand-beaded gold and ivory embroidery on a celestial angel wing" className="aspect-[4/3] w-full object-cover md:aspect-[4/5]" />
          <div className="glass-panel absolute bottom-3 left-3 max-w-[15rem] p-3 md:-bottom-6 md:-left-8 md:p-5"><Sparkles className="h-4 w-4 text-primary" strokeWidth={1} /><p className="mt-1 font-display text-lg md:mt-3 md:text-2xl italic">Made by hand.<br />Made only once.</p></div>
        </div>
      </section>

      <section className="px-4 py-4 sm:px-10 md:py-20">
        <div className="mx-auto max-w-[1400px] border-y border-border py-5 md:py-16">
          <div className="grid gap-4 md:grid-cols-3 md:gap-12">
            {[
              { icon: Feather, number: "01", title: "The hand", text: "Artistry is our language. Layers of textile, delicate stitches and tiny embellishments give each work its unmistakable human trace." },
              { icon: Heart, number: "02", title: "The story", text: "We create works to be felt as much as seen — quiet companions that bring narrative, memory and emotion into a space." },
              { icon: Gem, number: "03", title: "The singular", text: "True artistry is something that exists only once. Every acquisition is an invitation into a personal and unrepeatable world." },
            ].map((item) => <article key={item.title} className="border-border max-md:border-b max-md:pb-4 max-md:last:border-0 max-md:last:pb-0 md:border-r md:pr-10 md:last:border-0"><div className="flex items-center justify-between"><item.icon className="h-5 w-5 text-primary" strokeWidth={1} /><span className="text-[9px] tracking-[.25em] text-muted-foreground">{item.number}</span></div><h2 className="mt-2 text-3xl md:mt-7 md:text-4xl">{item.title}</h2><p className="mt-2 text-sm leading-relaxed md:mt-4 md:leading-7 text-muted-foreground">{item.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="relative my-3 overflow-hidden px-4 py-6 md:my-10 md:min-h-[70svh] md:p-0">
        <img src={forestHero} alt="A fairy sculpture in the enchanted forest world of Thy House Of Art" loading="lazy" width={1920} height={1280} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/55" />
        <div className="glass-panel relative mx-auto max-w-2xl p-5 text-center sm:p-9 md:my-24 md:p-14">
          <p className="eyebrow text-[14px]">Our philosophy</p>
          <blockquote className="mt-3 font-display text-3xl md:mt-6 italic leading-tight sm:text-5xl">“Artwork is the star of the show.”</blockquote>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed md:mt-6 md:leading-7 text-muted-foreground">GREAT ART ELEVATES EMOTION, AWAKENS IMAGINATION, AND BRINGS LIGHT TO OUR INNER WORLD AND THE SPACES WE INHABIT.</p>
          <Link to="/shop" className="btn-art mt-5 md:mt-8 text-[13px]">Enter the gallery <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}
