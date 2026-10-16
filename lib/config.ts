// Edit these to change the offer and options shown on the site.
export const CATEGORIES = ["Camping", "Beach", "Baby & kids", "Party", "Tools", "Other"] as const;

export const SUBURBS = [
  "Bellville", "Claremont", "Muizenberg", "Observatory", "Rondebosch",
  "Sea Point", "Table View", "Tokai", "Woodstock", "Other",
];

export const VALUE_CAP = 15000;          // max replacement value per item (R)
export const OWNER_COMMISSION = 0.15;    // Boleka's cut of the rent after the founding period
export const DAY_RATE_SHARE = 0.04;      // suggested day rate = 4% of replacement value
export const MAX_ITEMS = 5;              // items per registration

export const OFFER = {
  freeMonths: 3,         // founding owners pay 0% commission for this many months
  referralCredit: 50,    // R credit per referred owner whose item gets rented
};

export function suggestedRate(value: number) {
  return Math.max(10, Math.round((value * DAY_RATE_SHARE) / 5) * 5);
}

export function rand(n: number) {
  return "R" + Math.round(n).toLocaleString("en-ZA");
}
