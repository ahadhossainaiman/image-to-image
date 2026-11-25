export type CollectorReview = {
  id: string;
  title: string;
  quote: string;
  stars: number | null;
  attribution: string;
  reviewerName?: string;
  location?: string;
  theme: "dark" | "light";
};

// Legacy CMS imports combine the details with a dot or a spaced dash.
export function getCollectorIdentity(
  review: Pick<CollectorReview, "reviewerName" | "location" | "attribution">,
) {
  const separator = /[·•]|\s+[-–—]\s+/;
  const [legacyName = "", ...legacyLocation] = review.attribution.split(separator);
  const [explicitName = "", ...explicitLocation] = (review.reviewerName || "").split(separator);
  const name = explicitName.trim() || legacyName.trim();
  return {
    name: name === "Verified Collector" ? "" : name,
    location:
      review.location?.trim() ||
      explicitLocation.join(" · ").trim() ||
      legacyLocation.join(" · ").trim(),
  };
}

export const defaultCollectorReviews: CollectorReview[] = [
  {
    id: "review-1",
    title: "Exceeded Expectations",
    quote:
      "“From the moment I opened my treasured piece you created for me, I was captivated by her and your work. The beauty, exquisite workmanship, and extraordinary attention to detail is what I was hoping for as you exceeded my expectations. Every time I look at this angel, I love her even more. Thank you.”",
    stars: 5,
    attribution: "Eleanor W. · Charleston, SC",
    theme: "light",
  },
  {
    id: "review-2",
    title: "Absolutely Enchanted",
    quote:
      "“I am absolutely enchanted with my fairy that I just received from you. It was so hard to make my selection and love the one that is standing in front of me now. I wish that I could have them all. She is so beautiful! Thank you for sharing your beautiful artistry with me.”",
    stars: 5,
    attribution: "Amelia Rose B. · New York, NY",
    theme: "dark",
  },
  {
    id: "review-3",
    title: "A Gift for My Mother",
    quote:
      "“Dear Alba,\n\nThe beautiful piece I purchased from you was a gift for my mother, and I cannot begin to tell you how much joy it brought her. She was absolutely captivated by her beauty and detail. It was so much more than a gift; it was something truly special that touched her heart. Thank you, Alba, for creating something that could make such a meaningful moment for me and my mother.”",
    stars: 5,
    attribution: "Victoria E. · Asheville, NC",
    theme: "light",
  },
  {
    id: "review-4",
    title: "Perfect Heirloom",
    quote:
      "“Dear Alba Amore,\n\nI wanted to give my daughter something truly special to celebrate the arrival of her beautiful baby girl. Your creation is absolutely perfect. I can’t capture all the words of this exquisite fairy, but your love for your work does. We will always hold a special place in our hearts and can’t wait for my granddaughter to appreciate this beautiful heirloom. Thank you, Alba, for helping me give her something so meaningful and unforgettable.”",
    stars: 5,
    attribution: "Isabelle M. · Naples, FL",
    theme: "dark",
  },
  {
    id: "review-5",
    title: "20th Anniversary",
    quote:
      "“I wanted to find something truly extraordinary for my wife to celebrate our 20th wedding anniversary, and your creation was everything I had hoped for and more. She, and our daughters, were absolutely taken with its beauty, exquisite detail, and love you put into this fairy. Renne was so surprised. Her face light up. This was a special moment that will last for years. Thank you, Alba. You are very talented. I will be in touch with you. I’m sure our daughters will want their own.”",
    stars: 5,
    attribution: "Robert R. · Boca Raton, FL",
    theme: "light",
  },
  {
    id: "review-6",
    title: "For My Twin Sister",
    quote:
      "“I wanted to surprise my identical twin sister with something as special and unique as the bond we share. Your fairy is AMAZING! My sister loves the fairy. Alba, thank you from the bottom of my heart for putting so much love into your work. You helped me give my sister something truly unforgettable, and I am so grateful. I’ll be back.”",
    stars: 5,
    attribution: "Olivia K. · Palm Beach, FL",
    theme: "dark",
  },
  {
    id: "review-7",
    title: "Stunning Artistry",
    quote:
      "“Stunning! Alba, your artistry and attention to detail are extraordinary. Simply breathtaking!”",
    stars: 5,
    attribution: "Pamela P. · Palm Springs, CA",
    theme: "light",
  },
  {
    id: "review-8",
    title: "Extraordinary Expression",
    quote:
      "“An extraordinary expression of artistry! Your exquisite eye for detail, masterful execution, and imaginative vision transform this piece into something truly remarkable. This is why I chose to buy a piece from you. THANK YOU!”",
    stars: 5,
    attribution: "Genevieve S. · Carmel-by-the-Sea, CA",
    theme: "dark",
  },
  {
    id: "review-9",
    title: "Treasured Work of Art",
    quote:
      "“Absolutely breathtaking! I bought this piece for myself, and it has exceeded my expectations. Thy House of Art has beauty that I haven't seen anywhere else. Your artistic vision, workmanship, and attention to detail make this so much more than a beautiful object—it is a treasured work of art. I couldn't be happier with my choice!”",
    stars: 5,
    attribution: "Charlotte W. · Greenwich, CT",
    theme: "light",
  },
];
