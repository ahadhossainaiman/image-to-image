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

The storefront and cart display prices in the currency supplied by Wix. Wix
Hosted Checkout uses the pricing and payment settings configured in Wix.

## Contact submissions

The contact page submits to the studio's Wix **Enquiry Form** by default.
The verified field targets are `name`, `email_1139`, `phone_b88d`,
`inquiry_type`, and `tell_us_your_story`. The optional phone number uses
international format. When the enquiry comes from a product page, its
artwork name is included in the story.

To switch forms, set `VITE_WIX_ENQUIRY_FORM_ID` and
`VITE_WIX_ENQUIRY_FIELD_TARGETS` using `.env.example`, then rebuild.
If the replacement form has a separate artwork field, include its target
as `piece` in the mapping.

The contact page and collector-notes footer show confirmation only when
Wix returns `CONFIRMED`. On `PENDING`, they acknowledge the request. Both
responses reset the form and show a thank-you message for three seconds.
Wix requires an app or user identity with the
Manage form submissions permission to confirm pending records.

The footer submits emails to the studio's Wix **Subscribe Form**. That
form currently collects email addresses. To opt those contacts into Wix
Email Marketing, add an email subscription checkbox in Wix Forms and
set `VITE_WIX_SUBSCRIBE_CONSENT_TARGET` to its field target. The footer
then submits consent when visitors choose **Subscribe**.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
