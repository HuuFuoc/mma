// ─── Types ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  userName: string;
  /** Optional URL or local require() path */
  avatar?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  /** ISO date string, e.g. "2026-01-14" */
  createdAt: string;
  verifiedPurchase: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    userName: "Amélie Laurent",
    rating: 5,
    comment:
      "Absolutely stunning craftsmanship. The camel tan leather is even more beautiful in person — rich, supple, and incredibly well-structured. I've received so many compliments wearing it. Worth every single penny.",
    createdAt: "2026-01-14",
    verifiedPurchase: true,
  },
  {
    id: "r2",
    userName: "Sofia Marchetti",
    rating: 5,
    comment:
      "I've owned designer bags for over 20 years and this rivals them all. The stitching is immaculate, the hardware feels solid and weighty, and it holds its shape beautifully even when packed. A true luxury piece.",
    createdAt: "2026-02-03",
    verifiedPurchase: true,
  },
  {
    id: "r3",
    userName: "Naomi Chen",
    rating: 4,
    comment:
      "Gorgeous bag, extremely well made. Docking one star only because the chain strap is slightly shorter than I expected from the photos. The quality of the leather itself is exceptional — buttery soft.",
    createdAt: "2026-01-28",
    verifiedPurchase: true,
  },
  {
    id: "r4",
    userName: "Isabella Fontaine",
    rating: 5,
    comment:
      "Exceeded every expectation. It arrived beautifully packaged with a dust bag and authenticity card. The interior is lined in gold silk. This is a forever bag.",
    createdAt: "2025-12-19",
    verifiedPurchase: true,
  },
  {
    id: "r5",
    userName: "Yuki Tanaka",
    rating: 4,
    comment:
      "Very satisfied with my purchase. The color is exactly as pictured — a warm, earthy camel that works with everything. The clasp mechanism is smooth and feels precise and high quality.",
    createdAt: "2026-02-10",
    verifiedPurchase: false,
  },
  {
    id: "r6",
    userName: "Clara Wolff",
    rating: 3,
    comment:
      "Beautiful design but I noticed a slight imperfection in the seam near the bottom corner. Customer service was responsive and offered a replacement, which I appreciated. Adjusting my rating accordingly.",
    createdAt: "2026-01-07",
    verifiedPurchase: true,
  },
  {
    id: "r7",
    userName: "Priya Sharma",
    rating: 5,
    comment:
      "Third purchase from this brand and they never disappoint. The handbag is elegant, roomy enough for all my daily essentials, and the adjustable shoulder strap is a thoughtful touch. Perfect for work and evenings.",
    createdAt: "2026-02-22",
    verifiedPurchase: true,
  },
  {
    id: "r8",
    userName: "Rachel Dubois",
    rating: 5,
    comment:
      "A masterpiece. I debated for weeks before buying and I have zero regrets. The leather ages beautifully — I can already see it developing a gorgeous patina after just two months. Highest recommendation.",
    createdAt: "2026-01-31",
    verifiedPurchase: true,
  },
  {
    id: "r9",
    userName: "Hana Kim",
    rating: 2,
    comment:
      "Disappointed with the zipper — it caught on the lining twice in the first week of use. The bag itself looks lovely but I expected far better quality control at this price point.",
    createdAt: "2025-12-29",
    verifiedPurchase: true,
  },
  {
    id: "r10",
    userName: "Elise Beaumont",
    rating: 4,
    comment:
      "Stunning bag with no doubts about quality. My only note is that the magnetic closure could be slightly stronger. Everything else — the dimensions, the leather, the hardware — is absolutely first-rate.",
    createdAt: "2026-02-14",
    verifiedPurchase: false,
  },
];
