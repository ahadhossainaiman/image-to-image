# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Production SEO

Set `VITE_SITE_URL` to the site's canonical public origin before running
`npm run build`. The build writes page-specific HTML, `robots.txt`, and
`sitemap.xml` to `dist/`. With `VITE_WIX_CLIENT_ID` configured and Wix reachable at
build time, the sitemap also includes public product and collection URLs.

Serve `index.html` for `/` and resolve the five public URLs and `/cart` to
their matching HTML files before applying an SPA rewrite. Use `spa.html`
for client-rendered routes such as individual artwork and collection pages.
`npm run preview` uses this routing locally.

The Google Search Console and Bing Webmaster Tools verification tags live in
`index.html` and are included in every generated HTML page. After deployment,
verify ownership with the respective accounts and submit `/sitemap.xml`.

Set `VITE_GTM_CONTAINER_ID` to the production web container ID. Set
`VITE_META_PIXEL_ID` to the production Pixel ID for direct PageView tracking, or
leave it blank if the same Pixel is configured in the GTM container. Use the GTM
history-change trigger for client-side navigation if tracking route changes in GTM.

The storefront displays prices received in USD from Wix. Configure USD and the
approved product amounts in Wix before enabling USD checkout in production.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
