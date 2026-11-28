export const defaultSiteUrl = "https://thyhouseofart.com";
const siteName = "Thy House Of Art";

export const seoPages = {
  "/": {
    title: "Thy House of Art | Handmade Angel & Fairy Art",
    description: "Explore Thy House of Art. Discover one-of-a-kind handmade angel sculptures, mystical fairies, and original hand-embroidered merino wool art creations.",
    keywords: "thy house of art",
    type: "WebPage",
  },
  "/shop": {
    title: "Original Handmade Art Collections | Thy House of Art",
    description: "Browse original handmade art collections. Discover one-of-a-kind angel and fairy sculptures, woodland pieces, and bespoke merino wool fiber artworks.",
    keywords: "original handmade art collections",
    type: "CollectionPage",
  },
  "/atelier-story": {
    title: "Thy House of Art Atelier Story | Our Process",
    description: "Discover the Thy House of Art atelier story. Learn how each original fairy and angel sculpture is shaped and detailed by hand using fine merino wool.",
    keywords: "thy house of art atelier story",
    type: "AboutPage",
  },
  "/about-the-artists": {
    title: "Thy House of Art Artists | Alba & Zev Amóre",
    description: "Meet the Thy House of Art artists, Alba Amóre and Zev Amóre. Explore their story, inspirations, and passion for sculpting one-of-a-kind ethereal art.",
    keywords: "thy house of art artists",
    type: "AboutPage",
  },
  "/contact": {
    title: "Contact Thy House of Art | Art Commissions",
    description: "Contact Thy House of Art to commission a bespoke angel sculpture, acquire available fairy art, or inquire about custom handmade merino wool creations.",
    keywords: "contact thy house of art",
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
      ...("keywords" in page && { keywords: page.keywords }),
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
