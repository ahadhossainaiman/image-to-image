import type { HtmlTagDescriptor, Plugin } from "vite";

export function siteTags(containerValue?: string, pixelValue?: string): Plugin {
  const container = containerValue?.trim();
  const pixel = pixelValue?.trim();
  const tags: HtmlTagDescriptor[] = [];

  if (container && /^GTM-[A-Z0-9]+$/.test(container)) {
    tags.push(
      {
        tag: "script",
        injectTo: "head-prepend",
        children: `window.dataLayer = window.dataLayer || []; window.dataLayer.push({"gtm.start": Date.now(), event: "gtm.js"});`,
      },
      {
        tag: "script",
        injectTo: "head-prepend",
        attrs: { async: true, src: `https://www.googletagmanager.com/gtm.js?id=${container}` },
      },
      {
        tag: "noscript",
        injectTo: "body-prepend",
        children: [{ tag: "iframe", attrs: { title: "Google Tag Manager", src: `https://www.googletagmanager.com/ns.html?id=${container}`, height: "0", width: "0", hidden: true } }],
      },
    );
  }

  if (pixel && /^\d+$/.test(pixel)) {
    tags.push({
      tag: "script",
      injectTo: "head",
      children: `(() => {
        if (window.fbq) return;
        const queue = function () {
          if (queue.callMethod) queue.callMethod.apply(queue, arguments);
          else queue.queue.push(arguments);
        };
        queue.queue = [];
        queue.push = queue;
        queue.loaded = true;
        queue.version = "2.0";
        window.fbq = window._fbq = queue;
        queue("init", ${JSON.stringify(pixel)});
        queue("track", "PageView");
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.append(script);
      })();`,
    });
  }

  return { name: "thy-house-site-tags", transformIndexHtml: () => tags };
}
