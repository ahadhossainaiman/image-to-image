# Step-by-Step Wix Headless Setup Guide

This guide walks you through setting up your **Wix Headless** backend, obtaining your **Client ID**, and connecting your live store to **Thy House Of Art**.

---

## 1. How to Get Your Wix Client ID

### Option A: From an Existing Wix Studio / Wix Site
1. Go to [manage.wix.com](https://manage.wix.com) and log in.
2. Select your site.
3. In the left sidebar, navigate to **Settings** &rarr; **Headless Settings** (or search "Headless" in the top search bar).
4. Under **OAuth Apps / Client ID**, click **Create OAuth App** (or select your existing Headless Client).
5. Give your app a name (e.g. `Thy House Of Art Frontend`).
6. Set the **Redirect URLs** and **Allowed Domains**:
   - For local development:
     - `http://localhost:5173`
     - `http://localhost:3000`
   - For production (when deployed):
     - `https://your-domain.com`
7. Click **Save**.
8. Copy the **Client ID** (it looks like a long string or UUID, e.g. `12345678-abcd-...`).

---

### Option B: From the Wix Developers Portal
1. Go to the [Wix Developers Center](https://dev.wix.com/).
2. Log in and click **My Apps** &rarr; **Create New App**.
3. In the app dashboard, go to **OAuth** in the left menu.
4. Set the **App URL** to `http://localhost:5173` (or your live site URL).
5. Under **Redirect URLs**, add:
   - `http://localhost:5173`
   - `http://localhost:5173/cart`
6. Under **Permissions**, grant access to:
   - **Wix Stores (Read)**
   - **eCommerce (Read & Write)**
7. Copy your **App ID / Client ID** from the top of the OAuth page.

---

## 2. Configure Your Environment Variable

1. Open your project root in your editor.
2. Open the file [.env](file:///.env).
3. Paste your Client ID:
   ```ini
   VITE_WIX_CLIENT_ID=your_actual_wix_client_id_here
   ```
4. Save the file.
5. If your local development server was already running, restart it:
   ```bash
   npm run dev
   ```

---

## 3. Configure Your Wix Store Products & Collections

To make your artworks display with their bespoke luxury formatting, configure them in your Wix Dashboard:

### 3.1 Create Collections
Go to **Store Products** &rarr; **Collections** in your Wix Dashboard:
1. **Haute Artistry — Angel / Fairy**
   - Collection Name: `Haute Artistry — Angel / Fairy`
   - URL slug: `haute-artistry`
   - Add a cover image.
2. **Hand-Embroidered Merino Wool Mushroom Sculptures**
   - Collection Name: `Hand-Embroidered Merino Wool Mushroom Sculptures`
   - URL slug: `merino-mushrooms`
   - Add a cover image.

---

### 3.2 Add Artworks (Products)
Go to **Store Products** &rarr; **Products** &rarr; **+ New Product** &rarr; **Physical Product**:

1. **Title & Media**:
   - **Product Name**: e.g., `Celestial Angel — Original`
   - **Images**: Upload high-resolution gallery photographs (macro details, front view, in-situ lighting).
2. **Ribbon** *(Used for the artwork subtitle/intro)*:
   - Example: `A celestial presence, shaped by hand and dressed in light.`
3. **Description**:
   - Write the story of the artwork, inspiration, and artist notes.
4. **Custom Info Sections** *(Crucial for the gallery display)*:
   Click **+ Add an info section**:
   - **Section 1**: Title = `Medium` | Description = `Mixed-media textile sculpture with hand-embroidered pearls and silk.`
   - **Section 2**: Title = `Dimensions` | Description = `Height: 38cm, Width: 24cm, Depth: 18cm.`
   - **Section 3**: Title = `Authenticity` | Description = `Signed by the artist with wax seal Certificate of Authenticity.`
5. **Pricing**:
   - Enter the price (e.g. `2400` USD).
   - If an artwork is price-on-request, set the price to `0` or contact inquiry.
6. **Inventory & 1-of-1 Original Tracking**:
   - Check **Track inventory**.
   - Set **In stock quantity** = `1`.
   - When purchased, Wix automatically marks it as Out of Stock, and this app will display it as **"Acquired"**!
7. **Assign Collection**:
   - Check the matching collection (e.g., `Haute Artistry — Angel / Fairy`).
8. Click **Save**.

---

## 4. Set Up Payments & Checkout

In your Wix Dashboard:
1. Go to **Settings** &rarr; **Accept Payments**.
2. Connect your preferred payment provider:
   - **Wix Payments** / **Stripe** (Credit cards, Apple Pay, Google Pay)
   - **PayPal**
   - **Manual Payment** (Wire transfer / Private consultation for high-value art acquisitions).
3. Go to **Settings** &rarr; **Shipping & fulfillment**:
   - Configure your shipping rates (e.g. "Complimentary White-Glove Insured Delivery").

---

## 5. Test the Entire Purchase Flow

1. Run the local dev server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173/shop`.
3. You will see your live Wix products and collections seamlessly rendered with the gallery's emerald and starlight gold styling.
4. Click on an artwork &rarr; Click **Add to cart**.
5. Go to the **Cart** (`/cart`) &rarr; Click **Proceed to secure checkout**.
6. You will be redirected to the secure Wix Hosted Checkout page to test placing an order.
7. Upon completion, the customer returns to your gallery!

