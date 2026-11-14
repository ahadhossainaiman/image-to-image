import fs from "fs";

const reviews = [
  {
    Title: "Exceeded Expectations",
    Quote: "From the moment I opened my treasured piece you created for me, I was captivated by her and your work. The beauty, exquisite workmanship, and extraordinary attention to detail is what I was hoping for as you exceeded my expectations. Every time I look at this angel, I love her even more. Thank you.",
    Attribution: "Eleanor W. - Charleston, SC",
    Stars: 5,
    Theme: "light",
  },
  {
    Title: "Absolutely Enchanted",
    Quote: "I am absolutely enchanted with my fairy that I just received from you. It was so hard to make my selection and love the one that is standing in front of me now. I wish that I could have them all. She is so beautiful! Thank you for sharing your beautiful artistry with me.",
    Attribution: "Amelia Rose B. - New York, NY",
    Stars: 5,
    Theme: "dark",
  },
  {
    Title: "A Gift for My Mother",
    Quote: "The beautiful piece I purchased from you was a gift for my mother, and I cannot begin to tell you how much joy it brought her. She was absolutely captivated by her beauty and detail. It was so much more than a gift; it was something truly special that touched her heart. Thank you, Alba, for creating something that could make such a meaningful moment for me and my mother.",
    Attribution: "Victoria E. - Asheville, NC",
    Stars: 5,
    Theme: "light",
  },
  {
    Title: "Perfect Heirloom",
    Quote: "I wanted to give my daughter something truly special to celebrate the arrival of her beautiful baby girl. Your creation is absolutely perfect. I cannot capture all the words of this exquisite fairy, but your love for your work does. We will always hold a special place in our hearts and cannot wait for my granddaughter to appreciate this beautiful heirloom. Thank you, Alba, for helping me give her something so meaningful and unforgettable.",
    Attribution: "Isabelle M. - Naples, FL",
    Stars: 5,
    Theme: "dark",
  },
  {
    Title: "20th Anniversary",
    Quote: "I wanted to find something truly extraordinary for my wife to celebrate our 20th wedding anniversary, and your creation was everything I had hoped for and more. She, and our daughters, were absolutely taken with its beauty, exquisite detail, and love you put into this fairy. Renne was so surprised. Her face light up. This was a special moment that will last for years. Thank you, Alba. You are very talented. I will be in touch with you. I am sure our daughters will want their own.",
    Attribution: "Robert R. - Boca Raton, FL",
    Stars: 5,
    Theme: "light",
  },
  {
    Title: "For My Twin Sister",
    Quote: "I wanted to surprise my identical twin sister with something as special and unique as the bond we share. Your fairy is AMAZING! My sister loves the fairy. Alba, thank you from the bottom of my heart for putting so much love into your work. You helped me give my sister something truly unforgettable, and I am so grateful. I will be back.",
    Attribution: "Olivia K. - Palm Beach, FL",
    Stars: 5,
    Theme: "dark",
  },
  {
    Title: "Stunning Artistry",
    Quote: "Stunning! Alba, your artistry and attention to detail are extraordinary. Simply breathtaking!",
    Attribution: "Pamela P. - Palm Springs, CA",
    Stars: 5,
    Theme: "light",
  },
  {
    Title: "Extraordinary Expression",
    Quote: "An extraordinary expression of artistry! Your exquisite eye for detail, masterful execution, and imaginative vision transform this piece into something truly remarkable. This is why I chose to buy a piece from you. THANK YOU!",
    Attribution: "Genevieve S. - Carmel-by-the-Sea, CA",
    Stars: 5,
    Theme: "dark",
  },
  {
    Title: "Treasured Work of Art",
    Quote: "Absolutely breathtaking! I bought this piece for myself, and it has exceeded my expectations. Thy House of Art has beauty that I have not seen anywhere else. Your artistic vision, workmanship, and attention to detail make this so much more than a beautiful object - it is a treasured work of art. I could not be happier with my choice!",
    Attribution: "Charlotte W. - Greenwich, CT",
    Stars: 5,
    Theme: "light",
  },
];

const headers = ["Title", "Quote", "Attribution", "Stars", "Theme"];
const lines = [headers.join(",")];

for (const r of reviews) {
  const t = `"${r.Title.replace(/"/g, '""')}"`;
  const q = `"${r.Quote.replace(/"/g, '""')}"`;
  const a = `"${r.Attribution.replace(/"/g, '""')}"`;
  const s = r.Stars;
  const th = `"${r.Theme}"`;
  lines.push(`${t},${q},${a},${s},${th}`);
}

// UTF-8 BOM + Windows CRLF
const content = "\uFEFF" + lines.join("\r\n") + "\r\n";
fs.writeFileSync("d:/Wix/image-to-image-exactly/reviews.csv", content, "utf-8");
try {
  const downloadPath = `${process.env.USERPROFILE}/Downloads/reviews.csv`;
  fs.writeFileSync(downloadPath, content, "utf-8");
  console.log("Updated downloads:", downloadPath);
} catch (e) {
  console.warn("Could not write to downloads directly:", e.message);
}
console.log("Done!");

