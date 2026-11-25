import type { Plugin } from "vite";
import { buildPageHead, seoPaths, type SeoPath } from "../src/lib/seo";
import { getWixSitemapPaths } from "./wix-sitemap";

const headMarker = "<!-- page-seo -->";
const staticTag = "data-static-seo";
const fallbackHead = `<title ${staticTag}>Thy House Of Art</title>`;

function escapeMarkup(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function pageMarkup(path: SeoPath, origin: string) {
  const page = buildPageHead(path, origin);
  const metadata = Object.entries(page.attributes).map(([key, value]) =>
    `<meta ${staticTag} ${key.startsWith("og:") ? "property" : "name"}="${key}" content="${escapeMarkup(value)}">`,
  );
  return [
    `<title ${staticTag}>${escapeMarkup(page.title)}</title>`,
    ...metadata,
    `<link ${staticTag} rel="canonical" href="${escapeMarkup(page.canonical)}">`,
    `<script ${staticTag} type="application/ld+json">${page.structuredData}</script>`,
  ].join("\n    ");
}

function makeSitemap(origin: string, paths: readonly string[]) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...new Set(paths)].sort().map((path) => `  <url><loc>${escapeMarkup(new URL(path, origin).href)}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");
}

export function seoBuild(origin: string, wixClientId?: string): Plugin {
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", origin).href}\n`;

  return {
    name: "thy-house-seo",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = (request.url ?? "").split("?")[0];
        if (path === "/robots.txt" || path === "/sitemap.xml") {
          const isSitemap = path === "/sitemap.xml";
          response.setHeader("Content-Type", isSitemap ? "application/xml; charset=utf-8" : "text/plain; charset=utf-8");
          response.end(isSitemap ? makeSitemap(origin, seoPaths) : robots);
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        const pathname = (request.url ?? "").split("?")[0] ?? "";
        if ((request.method === "GET" || request.method === "HEAD") && pathname !== "/" && !pathname.includes(".")) {
          const path = pathname.replace(/\/$/, "");
          if (seoPaths.some((entry) => entry === path) || path === "/cart") {
            request.url = `${path}.html`;
          } else {
            request.url = "/spa.html";
          }
        }
        next();
      });
    },
    transformIndexHtml(html, { server, originalUrl }) {
      if (server && originalUrl) {
        const pathname = new URL(originalUrl, origin).pathname.replace(/\/$/, "") || "/";
        const path = seoPaths.find((entry) => entry === pathname);
        return html.replace(headMarker, path ? pageMarkup(path, origin) : fallbackHead);
      }
      return html;
    },
    generateBundle: {
      order: "post",
      async handler(_options, bundle) {
        const index = bundle["index.html"];
        if (index?.type !== "asset" || typeof index.source !== "string" || !index.source.includes(headMarker)) {
          this.error("The HTML build is missing the SEO head marker.");
        }
        const template = index.source;
        index.source = template.replace(headMarker, pageMarkup("/", origin));
        for (const path of seoPaths) {
          if (path !== "/") {
            this.emitFile({ type: "asset", fileName: `${path.slice(1)}.html`, source: template.replace(headMarker, pageMarkup(path, origin)) });
          }
        }
        this.emitFile({ type: "asset", fileName: "spa.html", source: template.replace(headMarker, fallbackHead) });
        this.emitFile({
          type: "asset",
          fileName: "cart.html",
          source: template.replace(headMarker, `${fallbackHead}\n    <meta ${staticTag} name="robots" content="noindex">`),
        });
        this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
        const catalogPaths = await getWixSitemapPaths(wixClientId);
        this.emitFile({ type: "asset", fileName: "sitemap.xml", source: makeSitemap(origin, [...seoPaths, ...catalogPaths]) });
      },
    },
  };
}
