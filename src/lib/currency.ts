type Price = { price: number | null; currency?: string | undefined };

export function catalogPrice(item: Price) {
  const currency = item.currency?.trim().toUpperCase();
  return currency && /^[A-Z]{3}$/.test(currency) && item.price != null && Number.isFinite(item.price) && item.price >= 0
    ? { amount: item.price, currency }
    : null;
}

export function formatPrice(item: Price) {
  const price = catalogPrice(item);
  if (!price) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: 0,
  }).format(price.amount);
}
