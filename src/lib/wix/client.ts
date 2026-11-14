import { createClient, OAuthStrategy, type Tokens } from "@wix/sdk";
import { products, collections } from "@wix/stores";
import { currentCart, checkout } from "@wix/ecom";
import { redirects } from "@wix/redirects";
import { items } from "@wix/data";

export const WIX_CLIENT_ID = (import.meta.env["VITE_WIX_CLIENT_ID"] as string | undefined)?.trim() || "";

export const isWixConfigured = (): boolean => {
  return typeof WIX_CLIENT_ID === "string" && WIX_CLIENT_ID.length > 0;
};

const WIX_TOKENS_STORAGE_KEY = "thoa-wix-tokens";

export function getStoredWixTokens(): Tokens | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(WIX_TOKENS_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (parsed?.refreshToken?.value) {
      return parsed as Tokens;
    }
  } catch {
    // Ignore invalid tokens in local storage
  }
  return undefined;
}

export function saveWixTokens(tokens: Tokens): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WIX_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // Ignore storage quota or incognito write errors
  }
}

export function createWixClientInstance(customTokens?: Tokens) {
  const tokens = customTokens ?? getStoredWixTokens();
  const clientId = WIX_CLIENT_ID || "unconfigured-client-id";

  return createClient({
    modules: {
      products,
      collections,
      currentCart,
      checkout,
      redirects,
      items,
    },
    auth: OAuthStrategy(tokens ? { clientId, tokens } : { clientId }),
  });
}

export const wixClient = createWixClientInstance();

/**
 * Ensures the visitor has an anonymous visitor token for guest cart and browsing operations.
 */
export async function ensureVisitorTokens(): Promise<Tokens | undefined> {
  if (typeof window === "undefined" || !isWixConfigured()) return undefined;

  const currentTokens = wixClient.auth.getTokens();
  if (currentTokens?.refreshToken?.value) {
    return currentTokens;
  }

  try {
    const visitorTokens = await wixClient.auth.generateVisitorTokens();
    wixClient.auth.setTokens(visitorTokens);
    saveWixTokens(visitorTokens);
    return visitorTokens;
  } catch (error) {
    console.warn("Wix Headless: Failed to generate visitor tokens:", error);
    return undefined;
  }
}
