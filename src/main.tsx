import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();
const trackingWindow = window as Window & { fbq?: (command: string, event: string) => void };
if (trackingWindow.fbq) {
  router.subscribe("onResolved", ({ fromLocation, pathChanged }) => {
    if (fromLocation && pathChanged) trackingWindow.fbq?.("track", "PageView");
  });
}

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  // The built HTML supplies the initial metadata. TanStack manages it after the app mounts.
  document.head.querySelectorAll("[data-static-seo]").forEach((tag) => tag.remove());
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

