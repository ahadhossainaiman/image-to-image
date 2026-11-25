import type { Artwork } from "@/data/catalog";
import { ArtCard } from "./ArtCard";

export function ArtCardGrid({ artworks }: { artworks: Artwork[] }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 md:mt-6 md:grid-cols-3 md:gap-y-8 lg:gap-x-7">
      {artworks.map((artwork, index) => (
        <ArtCard key={artwork.slug} a={artwork} priority={index < 2} />
      ))}
    </div>
  );
}
