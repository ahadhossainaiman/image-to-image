import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

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

