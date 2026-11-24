import type { Artwork } from "@/data/catalog";
import { ArtCard } from "./ArtCard";

export function ArtCardGrid({ artworks }: { artworks: Artwork[] }) {
  return (
    <div className="mt-3 grid gap-x-10 gap-y-6 md:mt-8 md:gap-y-20 md:grid-cols-2 lg:grid-cols-3">
      {artworks.map((artwork, index) => (
        <ArtCard key={artwork.slug} a={artwork} priority={index < 2} />
      ))}
    </div>
  );
}
