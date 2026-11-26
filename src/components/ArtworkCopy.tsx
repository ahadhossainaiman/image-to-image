import { createElement, Fragment, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const copyTags = new Set(["p", "div", "ul", "ol", "li", "blockquote"]);
const ignoredTags = new Set(["script", "style", "template", "iframe", "svg", "object", "noscript"]);

function copyNode(node: Node, key: number, budget?: { remaining: number }): ReactNode {
  if (budget?.remaining === 0) return null;
  if (node.nodeType === Node.TEXT_NODE) {
    const value = node.textContent ?? "";
    if (!budget) return value;
    const characters = Array.from(value);
    const visible = characters.slice(0, budget.remaining).join("");
    budget.remaining = Math.max(0, budget.remaining - characters.length);
    return budget.remaining === 0 ? `${visible.trimEnd()}…` : visible;
  }
  if (!(node instanceof HTMLElement)) return null;

  const tag = node.localName;
  if (ignoredTags.has(tag)) return null;
  let children: ReactNode = Array.from(node.childNodes, (child, index) => copyNode(child, index, budget));
  if (tag === "b" || tag === "strong" || node.style.fontWeight === "bold" || Number(node.style.fontWeight) >= 600) {
    children = <strong>{children}</strong>;
  }
  if (tag === "i" || tag === "em" || node.style.fontStyle === "italic") children = <em>{children}</em>;

  if (tag === "a") {
    const href = node.getAttribute("href")?.trim();
    if (href) {
      try {
        const url = new URL(href, document.baseURI);
        if (["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) {
          return <a key={key} href={url.href} className="text-accent underline underline-offset-2">{children}</a>;
        }
      } catch {
        // Keep the link text when Wix sends an invalid URL.
      }
    }
  }
  if (/^h[1-6]$/.test(tag)) return <h3 key={key} className="font-sans text-base font-semibold">{children}</h3>;
  if (tag === "br") return <br key={key} />;
  if (copyTags.has(tag)) return createElement(tag, { key }, children);
  return <Fragment key={key}>{children}</Fragment>;
}

type ArtworkCopyProps = { text: string; html: string | undefined };
const previewLength = 400;

export function ArtworkCopy({ text, html, limit }: ArtworkCopyProps & { limit?: number }) {
  const plainText = limit ? `${Array.from(text).slice(0, limit).join("").trimEnd()}…` : text;
  let content: ReactNode = <p className="whitespace-pre-line">{plainText}</p>;
  if (html && typeof document !== "undefined" && /<[a-z][^>]*>/i.test(html)) {
    const template = document.createElement("template");
    template.innerHTML = html;
    const budget = limit ? { remaining: limit } : undefined;
    content = Array.from(template.content.childNodes, (child, index) => copyNode(child, index, budget));
  }

  return (
    <div className="mt-2 max-w-prose space-y-3 text-sm leading-relaxed text-foreground/85 [overflow-wrap:anywhere]
      md:leading-7 [&_p+p]:mt-3 [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:ps-5 [&_ul]:ps-5
      [&_blockquote]:border-s-2 [&_blockquote]:border-primary/40 [&_blockquote]:ps-3">
      {content}
    </div>
  );
}

export function ArtworkDescription(props: ArtworkCopyProps) {
  if (Array.from(props.text).length <= previewLength) return <ArtworkCopy {...props} />;
  return <ExpandableArtworkDescription {...props} />;
}

function ExpandableArtworkDescription(props: ArtworkCopyProps) {
  const id = useId();
  const preview = useRef<HTMLDivElement>(null);
  const full = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [heights, setHeights] = useState<{ preview: number; full: number }>();

  useLayoutEffect(() => {
    const previewElement = preview.current;
    const fullElement = full.current;
    if (!previewElement || !fullElement) return;
    const measure = () => {
      const next = { preview: previewElement.offsetHeight, full: fullElement.offsetHeight };
      setHeights((current) => current?.preview === next.preview && current.full === next.full ? current : next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(previewElement);
    observer.observe(fullElement);
    measure();
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        id={id}
        className="relative overflow-hidden motion-safe:transition-[height] motion-safe:duration-300 motion-safe:ease-in-out"
        style={{ height: heights?.[expanded ? "full" : "preview"] }}
      >
        <div
          ref={preview}
          aria-hidden={expanded}
          inert={expanded}
          className={`flow-root motion-safe:transition-opacity motion-safe:duration-200 ${expanded ? "opacity-0" : "opacity-100"}`}
        >
          <ArtworkCopy {...props} limit={previewLength} />
        </div>
        <div
          ref={full}
          aria-hidden={!expanded}
          inert={!expanded}
          className={`absolute inset-x-0 top-0 flow-root motion-safe:transition-opacity motion-safe:duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}
        >
          <ArtworkCopy {...props} />
        </div>
      </div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded((open) => !open)}
        className="mt-2 min-h-10 cursor-pointer text-sm font-medium text-accent underline underline-offset-4 hover:text-foreground"
      >
        {expanded ? "See less" : "See more"}
      </button>
    </>
  );
}
