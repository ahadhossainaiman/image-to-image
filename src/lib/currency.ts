export const storeCurrency = "USD";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: storeCurrency,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function isUsd(currency: string | null | undefined) {
  return currency?.trim().toUpperCase() === storeCurrency;
}

export function usdPrice(item: { price: number | null; currency?: string | undefined }) {
  return isUsd(item.currency) && item.price != null && Number.isFinite(item.price) ? item.price : null;
}

export function formatPrice(item: { price: number | null; currency?: string | undefined }) {
  const price = usdPrice(item);
  return price == null ? "" : usdFormatter.format(price);
}
