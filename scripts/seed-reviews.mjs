import { createClient, OAuthStrategy, ApiKeyStrategy } from "@wix/sdk";
import { items } from "@wix/data";
import fs from "fs";

// Load .env manually without extra dependencies
try {
  if (fs.existsSync(".env")) {
    const envContent = fs.readFileSync(".env", "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val.trim();
      }
    }
  }
} catch {
  // Ignore
}

const CLIENT_ID = process.env.VITE_WIX_CLIENT_ID || "d7253fb8-72ee-49c8-b3f4-ea471d6a99e6";
const API_KEY = process.env.WIX_API_KEY;
const SITE_ID = process.env.WIX_SITE_ID;

const auth = API_KEY && SITE_ID
  ? ApiKeyStrategy({ apiKey: API_KEY, siteId: SITE_ID })
  : OAuthStrategy({ clientId: CLIENT_ID });

const wixClient = createClient({
  modules: { items },
  auth,
});

const reviews = [
  {
    title: "Exceeded Expectations",
    quote: "“From the moment I opened my treasured piece you created for me, I was captivated by her and your work. The beauty, exquisite workmanship, and extraordinary attention to detail is what I was hoping for as you exceeded my expectations. Every time I look at this angel, I love her even more. Thank you.”",
    attribution: "Eleanor W. · Charleston, SC",
    stars: 5,
    theme: "light",
  },
  {
    title: "Absolutely Enchanted",
    quote: "“I am absolutely enchanted with my fairy that I just received from you. It was so hard to make my selection and love the one that is standing in front of me now. I wish that I could have them all. She is so beautiful! Thank you for sharing your beautiful artistry with me.”",
    attribution: "Amelia Rose B. · New York, NY",
    stars: 5,
    theme: "dark",
  },
  {
    title: "A Gift for My Mother",
    quote: "“The beautiful piece I purchased from you was a gift for my mother, and I cannot begin to tell you how much joy it brought her. She was absolutely captivated by her beauty and detail. It was so much more than a gift; it was something truly special that touched her heart. Thank you, Alba, for creating something that could make such a meaningful moment for me and my mother.”",
    attribution: "Victoria E. · Asheville, NC",
    stars: 5,
    theme: "light",
  },
  {
    title: "Perfect Heirloom",
    quote: "“I wanted to give my daughter something truly special to celebrate the arrival of her beautiful baby girl. Your creation is absolutely perfect. I can’t capture all the words of this exquisite fairy, but your love for your work does. We will always hold a special place in our hearts and can’t wait for my granddaughter to appreciate this beautiful heirloom. Thank you, Alba, for helping me give her something so meaningful and unforgettable.”",
    attribution: "Isabelle M. · Naples, FL",
    stars: 5,
    theme: "dark",
  },
  {
    title: "20th Anniversary",
    quote: "“I wanted to find something truly extraordinary for my wife to celebrate our 20th wedding anniversary, and your creation was everything I had hoped for and more. She, and our daughters, were absolutely taken with its beauty, exquisite detail, and love you put into this fairy. Renne was so surprised. Her face light up. This was a special moment that will last for years. Thank you, Alba. You are very talented. I will be in touch with you. I’m sure our daughters will want their own.”",
    attribution: "Robert R. · Boca Raton, FL",
    stars: 5,
    theme: "light",
  },
  {
    title: "For My Twin Sister",
    quote: "“I wanted to surprise my identical twin sister with something as special and unique as the bond we share. Your fairy is AMAZING! My sister loves the fairy. Alba, thank you from the bottom of my heart for putting so much love into your work. You helped me give my sister something truly unforgettable, and I am so grateful. I’ll be back.”",
    attribution: "Olivia K. · Palm Beach, FL",
    stars: 5,
    theme: "dark",
  },
  {
    title: "Stunning Artistry",
    quote: "“Stunning! Alba, your artistry and attention to detail are extraordinary. Simply breathtaking!”",
    attribution: "Pamela P. · Palm Springs, CA",
    stars: 5,
    theme: "light",
  },
  {
    title: "Extraordinary Expression",
    quote: "“An extraordinary expression of artistry! Your exquisite eye for detail, masterful execution, and imaginative vision transform this piece into something truly remarkable. This is why I chose to buy a piece from you. THANK YOU!”",
    attribution: "Genevieve S. · Carmel-by-the-Sea, CA",
    stars: 5,
    theme: "dark",
  },
  {
    title: "Treasured Work of Art",
    quote: "“Absolutely breathtaking! I bought this piece for myself, and it has exceeded my expectations. Thy House of Art has beauty that I haven't seen anywhere else. Your artistic vision, workmanship, and attention to detail make this so much more than a beautiful object—it is a treasured work of art. I couldn't be happier with my choice!”",
    attribution: "Charlotte W. · Greenwich, CT",
    stars: 5,
    theme: "light",
  },
];

async function run() {
  if (!API_KEY) {
    console.log("Generating visitor tokens...");
    const tokens = await wixClient.auth.generateVisitorTokens();
    wixClient.auth.setTokens(tokens);
  }

  console.log("Bulk inserting 9 reviews into collection 'Reviews'...");
  try {
    const res = await wixClient.items.bulkInsert("Reviews", reviews);
    if (res.errors && res.errors.length > 0) {
      console.warn(`Bulk insert completed with ${res.errors.length} errors:`, res.errors[0]?.message);
      console.log("\nTIP: If the error says 'permission to insert', in Wix Dashboard go to:");
      console.log("CMS > Reviews > More Actions > Permissions & Privacy -> set 'Who can create content' to 'Anyone', then run again!");
    } else {
      console.log(`Success! Inserted ${res.inserted} items.`);
    }
  } catch (err) {
    console.error("Bulk insert failed:", err);
  }
}

run();
