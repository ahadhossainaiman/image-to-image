import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Feather, Gem, Heart, ImageIcon, Sparkles } from "lucide-react";
import angel2 from "@/assets/angel-2.jpg";
import forestHero from "@/assets/enchanted-forest-hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "Atelier Story — Thy House Of Art" },
    { name: "description", content: "Enter the story and handmade philosophy behind Thy House Of Art’s singular celestial and woodland sculptures." },
    { property: "og:title", content: "Atelier Story — Thy House Of Art" },
    { property: "og:description", content: "An independent art house where artistry, storytelling and wonder meet." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: About,
});

function About() {
  return (
    <>
      <section className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 py-16 sm:px-10 lg:grid-cols-[1fr_.9fr] lg:py-24">
        <div>
          <p className="eyebrow">The atelier story</p>
          <h1 className="mt-6 text-6xl leading-[.95] sm:text-7xl lg:text-8xl">A house of<br /><em className="text-accent">wonder.</em></h1>
          <p className="mt-8 max-w-xl font-display text-2xl italic leading-snug text-foreground">Where angels and fairies live — and where the smallest handmade details become lasting emotional treasures.</p>
          <p className="mt-7 max-w-xl text-sm leading-7 text-muted-foreground">Thy House Of Art is an independent art studio devoted to one-of-a-kind handmade creations. Our world brings together celestial figures, botanical imagination and the meditative artistry of embroidery.</p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">Every piece is shaped, stitched and finished individually. No moulded editions, no repeated works: only singular objects with their own presence, provenance and story.</p>
        </div>
        <div className="glass-panel relative p-3">
          <img src={angel2} alt="Hand-beaded gold and ivory embroidery on a celestial angel wing" className="aspect-[4/5] w-full object-cover" />
          <div className="glass-panel absolute -bottom-6 -left-4 max-w-[15rem] p-5 sm:-left-8"><Sparkles className="h-4 w-4 text-primary" strokeWidth={1} /><p className="mt-3 font-display text-2xl italic">Made by hand.<br />Made only once.</p></div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-10">
        <div className="mx-auto max-w-[1400px] border-y border-border py-16">
          <div className="grid gap-12 md:grid-cols-3">
            {[
              { icon: Feather, number: "01", title: "The hand", text: "Artistry is our language. Layers of textile, delicate stitches and tiny embellishments give each work its unmistakable human trace." },
              { icon: Heart, number: "02", title: "The story", text: "We create works to be felt as much as seen — quiet companions that bring narrative, memory and emotion into a space." },
              { icon: Gem, number: "03", title: "The singular", text: "True artistry is something that exists only once. Every acquisition is an invitation into a personal and unrepeatable world." },
            ].map((item) => <article key={item.title} className="md:border-r md:border-border md:pr-10 md:last:border-0"><div className="flex items-center justify-between"><item.icon className="h-5 w-5 text-primary" strokeWidth={1} /><span className="text-[9px] tracking-[.25em] text-muted-foreground">{item.number}</span></div><h2 className="mt-7 text-4xl">{item.title}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{item.text}</p></article>)}
          </div>
        </div>
      </section>

      <section aria-labelledby="about-us-heading" className="mx-auto max-w-[1400px] px-5 py-16 sm:px-10 lg:py-24">
        <div className="text-center">
          <p className="eyebrow">DISCOVER THE BEAUTY WITHIN</p>
          <h2 id="about-us-heading" className="mt-5 text-5xl sm:text-6xl">About Us</h2>
        </div>
        <div className="mt-12 grid gap-12 md:grid-cols-2">
          {["ALBA", "ZEV AMORE"].map((name) => (
            <article key={name}>
              <div role="img" aria-label={`Portrait of ${name} awaiting client photograph`} className="glass-panel flex aspect-[4/5] items-center justify-center">
                <div className="text-center text-muted-foreground"><ImageIcon className="mx-auto h-7 w-7 text-primary" strokeWidth={1} /><p className="mt-5 text-xs">Portrait forthcoming</p></div>
              </div>
              <h3 className="mt-7 text-4xl">{name}</h3>
              <div className="mt-5 min-h-24 border-t border-border pt-5"><p className="text-sm leading-7 text-muted-foreground">Biography forthcoming.</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative my-10 min-h-[70svh] overflow-hidden">
        <img src={forestHero} alt="A fairy sculpture in the enchanted forest world of Thy House Of Art" loading="lazy" width={1920} height={1280} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/55" />
        <div className="glass-panel relative mx-auto my-24 max-w-2xl p-9 text-center sm:p-14">
          <p className="eyebrow">Our philosophy</p>
          <blockquote className="mt-6 font-display text-4xl italic leading-tight sm:text-5xl">“Artwork is the star of the show.”</blockquote>
          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-muted-foreground">GREAT ART ELEVATES EMOTION, AWAKENS IMAGINATION, AND BRINGS LIGHT TO OUR INNER WORLD AND THE SPACES WE INHABIT.</p>
          <Link to="/shop" className="btn-art mt-8">Enter the gallery <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}
