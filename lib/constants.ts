export const DENOMINATIONS = ["100", "200", "750", "1500", "7500", "25000", "40000"] as const;

export type Denomination = (typeof DENOMINATIONS)[number];

export const DENOMINATION_LABELS: Record<Denomination, string> = {
  "100": "Rs. 100",
  "200": "Rs. 200",
  "750": "Rs. 750",
  "1500": "Rs. 1,500",
  "7500": "Rs. 7,500",
  "25000": "Rs. 25,000",
  "40000": "Rs. 40,000",
};

export const PRIZE_TIERS = ["1st Prize", "2nd Prize", "3rd Prize"] as const;
