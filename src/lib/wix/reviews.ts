import { wixClient, isWixConfigured } from "./client";
import { defaultCollectorReviews, type CollectorReview } from "@/data/reviews";

function firstText(...values: unknown[]): string {
  return (
    values
      .find((value): value is string => typeof value === "string" && value.trim().length > 0)
      ?.trim() || ""
  );
}

function legacyImageAttribution(value: unknown): string {
  // The existing Reviews CSV import mapped Attribution to the "image" field.
  // Only accept combined collector text here, never an actual image URL.
  if (typeof value !== "string" || /^(?:[a-z][a-z\d+.-]*:|\/)/i.test(value.trim())) return "";
  return /[·•]|\s+[-–—]\s+/.test(value) ? value.trim() : "";
}

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
          return response.items.map((item, index: number) => ({
            id: item._id || `review-${index}`,
            title: item["title"] || item["name"] || "Collector Reflection",
            quote: item["quote"] || item["review"] || item["content"] || item["description"] || "",
            stars:
              typeof item["stars"] === "number"
                ? item["stars"]
                : typeof item["rating"] === "number"
                  ? item["rating"]
                  : 5,
            attribution:
              firstText(
                item["attribution"],
                item["author"],
                item["collector"],
                legacyImageAttribution(item["image"]),
              ) || "Verified Collector",
            reviewerName: firstText(
              item["reviewerName"],
              item["authorName"],
              item["author"],
              item["collector"],
              item["name"],
            ),
            location: firstText(item["location"], item["reviewerLocation"]),
            theme:
              item["theme"] === "light"
                ? ("light" as const)
                : item["theme"] === "dark"
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
    console.warn(
      "Wix Headless: Failed to query reviews from Wix CMS, falling back to curated reviews:",
      error,
    );
    return defaultCollectorReviews;
  }
}
