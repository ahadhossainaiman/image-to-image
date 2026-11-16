import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCollectorIdentity } from "@/data/reviews";
import { getCollectorReviews } from "@/lib/wix/reviews";

const { find } = vi.hoisted(() => ({ find: vi.fn() }));

vi.mock("@/lib/wix/client", () => ({
  isWixConfigured: () => true,
  wixClient: { items: { query: () => ({ limit: () => ({ find }) }) } },
}));

describe("CMS collector identity", () => {
  beforeEach(() => find.mockReset());

  it("shows the identity from the live CMS's legacy image field", async () => {
    find.mockRejectedValueOnce(new Error("Collection does not exist"));
    find.mockResolvedValueOnce({
      items: [
        {
          _id: "review-live",
          title: "Extraordinary Expression",
          description: "An extraordinary expression of artistry!",
          image: "Genevieve S. - Carmel-by-the-Sea, CA",
        },
      ],
    });

    const reviews = await getCollectorReviews();
    expect(reviews).toHaveLength(1);
    expect(getCollectorIdentity(reviews[0]!)).toEqual({
      name: "Genevieve S.",
      location: "Carmel-by-the-Sea, CA",
    });
  });

  it("prefers explicit CMS name and location over legacy imported text", async () => {
    find.mockResolvedValue({
      items: [
        {
          reviewerName: "Updated Collector",
          location: "London, UK",
          image: "Old Name - Old Location",
        },
      ],
    });
    const reviews = await getCollectorReviews();
    expect(getCollectorIdentity(reviews[0]!)).toEqual({
      name: "Updated Collector",
      location: "London, UK",
    });
  });

  it("does not show an actual image URL as a collector name", async () => {
    find.mockResolvedValue({ items: [{ image: "https://example.com/a - b.jpg" }] });
    const reviews = await getCollectorReviews();
    expect(getCollectorIdentity(reviews[0]!)).toEqual({ name: "", location: "" });
  });
});
