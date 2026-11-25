export const defaultSiteUrl = "https://thyhouseofart.com";
const siteName = "Thy House Of Art";

export const seoPages = {
  "/": {
    title: "Thy House Of Art | Handmade Angel & Fairy Art",
    description: "Discover one-of-a-kind handmade angel and fairy sculptures, woodland art and hand-embroidered merino wool works from Thy House Of Art.",
    type: "WebPage",
  },
  "/shop": {
    title: "Handmade Art Collections & Gallery | Thy House Of Art",
    description: "Browse the Thy House Of Art gallery for one-of-a-kind angel and fairy sculptures, woodland pieces and hand-embroidered merino wool artworks.",
    type: "CollectionPage",
  },
  "/atelier-story": {
    title: "Our Atelier Story & Handmade Process | Thy House Of Art",
    description: "Discover how Thy House Of Art shapes, stitches and finishes each original sculpture and textile artwork by hand, one piece at a time.",
    type: "AboutPage",
  },
  "/about-the-artists": {
    title: "Meet Artists Alba & Zev Amóre | Thy House Of Art",
    description: "Meet Alba Amóre and Zev Amóre, the artists behind Thy House Of Art, and explore the stories and inspirations behind the independent atelier.",
    type: "AboutPage",
  },
  "/contact": {
    title: "Bespoke Art Commissions & Inquiries | Thy House Of Art",
    description: "Contact Thy House Of Art about acquiring an original piece or commissioning a bespoke handmade artwork for a collection, gift or special occasion.",
    type: "ContactPage",
  },
} as const;

export type SeoPath = keyof typeof seoPages;
export const seoPaths = Object.keys(seoPages) as SeoPath[];

export function getSiteOrigin(value?: string) {
  const url = new URL(value?.trim() || defaultSiteUrl);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) {
    throw new Error("VITE_SITE_URL must be an absolute HTTP(S) origin.");
  }
  return url.origin;
}

export function catalogCanonical(path: "/artwork" | "/collections", slug: string) {
  return new URL(`${path}/${encodeURIComponent(slug)}`, getSiteOrigin(import.meta.env["VITE_SITE_URL"])).href;
}

export function buildPageHead(path: SeoPath, origin: string) {
  const page = seoPages[path];
  const canonical = new URL(path, origin).href;
  const home = new URL("/", origin).href;
  const image = path === "/about-the-artists"
    ? { url: "/ALBA-IN-THE-MIRROR.png", alt: "Artist Alba Amóre beside her reflection" }
    : { url: "/Golden_Fairy_with_Butterfly_Wings.png", alt: "Golden fairy with butterfly wings" };
  const imageUrl = new URL(image.url, origin).href;
  const website = { "@id": `${home}#website` };
  const organization = { "@id": `${home}#organization` };
  const pageData = {
    "@type": page.type,
    "@id": `${canonical}#page`,
    url: canonical,
    name: page.title,
    description: page.description,
    isPartOf: website,
    about: organization,
  };
  const graph = path === "/" ? [
    { ...organization, "@type": "Organization", name: siteName, url: home, logo: new URL("/Thy_House_Of_Art_Logo.png", origin).href, sameAs: ["https://www.instagram.com/thyhouseofart"] },
    { ...website, "@type": "WebSite", name: siteName, url: home, inLanguage: "en", publisher: organization },
    pageData,
  ] : [pageData];

  return {
    title: page.title,
    attributes: {
      description: page.description,
      "og:type": "website",
      "og:site_name": siteName,
      "og:title": page.title,
      "og:description": page.description,
      "og:url": canonical,
      "og:image": imageUrl,
      "og:image:alt": image.alt,
      "twitter:card": "summary_large_image",
      "twitter:title": page.title,
      "twitter:description": page.description,
      "twitter:image": imageUrl,
      "twitter:image:alt": image.alt,
    },
    canonical,
    structuredData: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c"),
  };
}

export function getPageHead(path: SeoPath) {
  const page = buildPageHead(path, getSiteOrigin(import.meta.env["VITE_SITE_URL"]));
  return {
    meta: [
      { title: page.title },
      ...Object.entries(page.attributes).map(([key, content]) =>
        key.startsWith("og:") ? { property: key, content } : { name: key, content },
      ),
    ],
    links: [{ rel: "canonical", href: page.canonical }],
    scripts: [{ type: "application/ld+json", children: page.structuredData }],
  };
}
