import { wixClient, isWixConfigured } from "./client";
import { defaultCollectorReviews, type CollectorReview } from "@/data/reviews";

/**
 * Fetches collector reviews dynamically from Wix Headless CMS.
 * Checks for a data collection named 'CollectorReviews' or 'Reviews'.
 * Falls back seamlessly to the curated local reviews if unconfigured or not found.
 */
export async function getCollectorReviews(): Promise<CollectorReview[]> {
  if (!isWixConfigured()) {
    return defaultCollectorReviews;
  }

  try {
    // Attempt to query Wix CMS collection
    const collectionsToTry = ["CollectorReviews", "Reviews"];
    for (const collectionId of collectionsToTry) {
      try {
        const response = await wixClient.items.query(collectionId).limit(20).find();
        if (response.items && response.items.length > 0) {
          return response.items.map((item: any, index: number) => ({
            id: item._id || `review-${index}`,
            title: item.title || item.name || "Collector Reflection",
            quote: item.quote || item.review || item.content || item.description || "",
            stars: typeof item.stars === "number" ? item.stars : typeof item.rating === "number" ? item.rating : 5,
            attribution: item.attribution || item.author || item.collector || "Verified Collector",
            theme:
              item.theme === "light"
                ? ("light" as const)
                : item.theme === "dark"
                ? ("dark" as const)
                : index % 2 === 1
                ? ("light" as const)
                : ("dark" as const),
          }));
        }
      } catch {
        // Try next collection
      }
    }

    return defaultCollectorReviews;
  } catch (error) {
    console.warn("Wix Headless: Failed to query reviews from Wix CMS, falling back to curated reviews:", error);
    return defaultCollectorReviews;
  }
}

