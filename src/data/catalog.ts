import angel1 from "@/assets/angel-1.jpg";
import angel2 from "@/assets/angel-2.jpg";
import mush1 from "@/assets/mushroom-1.jpg";
import mush2 from "@/assets/mushroom-2.jpg";
import hero from "@/assets/hero.jpg";

export type Category = {
  slug: string;
  wixCollectionId?: string;
  name: string;
  shortName: string;
  description: string;
  image?: string;
  published: boolean;
};

export type ArtworkImage = {
  src: string;
  alt: string;
  name?: string;
  kind?: "image";
  width?: number;
  height?: number;
  thumbnail?: string;
};
export type ArtworkMedia = ArtworkImage | { src: string; alt: string; name?: string; kind: "video"; poster?: string };

export type Artwork = {
  slug: string;
  wixProductId?: string;
  title: string;
  reference: string;
  category: string;
  wixCollectionIds?: string[];
  medium: string;
  availability: "available" | "acquired";
  price: number | null;
  currency: string;
  intro: string;
  description: string;
  details: string[];
  images: ArtworkImage[];
  wixDetails?: {
    gallery: ArtworkMedia[];
    descriptionHtml?: string;
    sku: string;
    brand: string;
    ribbons: string[];
    stockLabel: string;
    productType?: string;
    requiresPurchaseOptions?: boolean;
    dimensions: string;
    packageDimensions: string;
    weight?: number;
    stockQuantity?: number;
    regularPrice: string;
    priceRange: string;
    unitPrice: string;
    unitQuantity: string;
    sections: { title: string; text: string; html?: string }[];
    options: { name: string; choices: string[] }[];
    variants: {
      name: string;
      price: string;
      regularPrice: string;
      unitPrice: string;
      sku: string;
      dimensions: string;
      packageDimensions: string;
      weight?: number;
      stockLabel: string;
      stockQuantity?: number;
    }[];
    customizations: { title: string; mandatory?: boolean; maxLength?: number }[];
  };
  published: boolean;
};

// Edit here to manage the gallery. Set published:false to hide a category or artwork.
export const categories: Category[] = [
  {
    slug: "haute-artistry",
    name: "Haute Artistry — Angel / Fairy",
    shortName: "Angels & Fairies",
    description: "Couture celestial figures, hand-dressed in silk, lace, delicate beadwork and quiet celestial detail.",
    image: angel1,
    published: true,
  },
  {
    slug: "merino-mushrooms",
    name: "Hand-Embroidered Merino Wool Mushroom Sculptures",
    shortName: "Merino Sculptures",
    description: "Felted merino forms embroidered stitch by stitch, each carrying a miniature botanical world.",
    image: mush1,
    published: true,
  },
  { slug: "category-3", name: "Category 3", shortName: "Future Collection", description: "Coming soon.", published: false },
  { slug: "category-4", name: "Category 4", shortName: "Future Collection", description: "Coming soon.", published: false },
  { slug: "category-5", name: "Category 5", shortName: "Future Collection", description: "Coming soon.", published: false },
  { slug: "category-6", name: "Category 6", shortName: "Future Collection", description: "Coming soon.", published: false },
];

export const artworks: Artwork[] = [
  {
    slug: "sample-celestial-angel",
    title: "Celestial Angel — Sample",
    reference: "THOA–HA–001",
    category: "haute-artistry",
    medium: "Mixed-media textile sculpture",
    availability: "available",
    price: null,
    currency: "USD",
    intro: "A celestial presence, shaped by hand and dressed in light.",
    description: "This sample artwork introduces the atelier’s celestial collection: an imagined guardian formed through layered textiles, intricate hand-beading and delicate botanical details. The artist’s own story and provenance will accompany the final piece.",
    details: ["One-of-a-kind handmade sculpture", "Mixed textiles, lace and hand-beaded details", "Materials and dimensions to be confirmed", "Certificate of Authenticity included with final acquisition"],
    images: [
      { src: angel1, name: "angel-1", alt: "Handmade celestial angel sculpture with couture beadwork and feathered wings" },
      { src: angel2, name: "angel-2", alt: "Close-up of gold embroidery and pearl details on an angel wing" },
      { src: hero, name: "hero", alt: "Handmade fairy sculpture with lace wings displayed in soft gallery light" },
    ],
    published: true,
  },
  {
    slug: "sample-meadow-mushroom",
    title: "Meadow Mushrooms — Sample",
    reference: "THOA–MW–001",
    category: "merino-mushrooms",
    medium: "Hand-embroidered merino wool",
    availability: "available",
    price: null,
    currency: "USD",
    intro: "A small woodland world, held in wool and thread.",
    description: "This sample sculpture celebrates the quiet intricacy of the forest floor. Soft merino forms become a canvas for embroidered wildflowers, stems and tiny woodland discoveries. Final material notes and dimensions will be supplied by the artist.",
    details: ["One-of-a-kind handmade sculpture", "Hand-embroidered merino wool", "Dimensions to be confirmed", "Certificate of Authenticity included with final acquisition"],
    images: [
      { src: mush1, name: "mushroom-1", alt: "Hand-embroidered merino wool mushroom sculpture with botanical wildflowers" },
      { src: mush2, name: "mushroom-2", alt: "Macro view of hand-embroidered stitches and felted merino wool texture" },
    ],
    published: true,
  },
];

export const publicCategories = () => categories.filter((category) => category.published);
export const getCategory = (slug: string) => categories.find((category) => category.slug === slug && category.published);
export const artworksIn = (slug: string) => artworks.filter((artwork) => artwork.category === slug && artwork.published);
export const getArtwork = (slug: string) => artworks.find((artwork) => artwork.slug === slug && artwork.published);
