import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { seoBuild } from "./scripts/seo-build";
import { getSiteOrigin } from "./src/lib/seo";

export default defineConfig(({ mode }) => ({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    seoBuild(getSiteOrigin(loadEnv(mode, process.cwd(), "VITE_SITE_URL")["VITE_SITE_URL"])),
  ],
  resolve: { tsconfigPaths: true },
  server: {
    host: true,
    port: 8080,
    allowedHosts: ["image.algorithmalliance.com"],
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
}));
