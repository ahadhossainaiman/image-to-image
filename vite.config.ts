import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { seoBuild } from "./scripts/seo-build";
import { siteTags } from "./scripts/site-tags";
import { getSiteOrigin } from "./src/lib/seo";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const siteOrigin = getSiteOrigin(env["VITE_SITE_URL"]);
  return {
    plugins: [
      TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      seoBuild(siteOrigin, env["VITE_WIX_CLIENT_ID"]),
      siteTags(env["VITE_GTM_CONTAINER_ID"], env["VITE_META_PIXEL_ID"]),
    ],
    resolve: { tsconfigPaths: true },
    server: {
      host: true,
      port: 8080,
      allowedHosts: [new URL(siteOrigin).hostname],
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [{ name: "wix", test: /node_modules[\\/]@wix[\\/]/ }],
          },
        },
      },
    },
  };
});
