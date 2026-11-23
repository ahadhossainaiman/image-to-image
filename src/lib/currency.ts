import { useSyncExternalStore } from "react";
import type { Artwork } from "@/data/catalog";

export const currencyOptions = [
  { code: "USD", label: "USD", rate: 1 },
  { code: "EUR", label: "EUR", rate: 0.92 },
  { code: "GBP", label: "GBP", rate: 0.79 },
] as const;

export type CurrencyCode = (typeof currencyOptions)[number]["code"];
const KEY = "thoa-currency";
const subscribers = new Set<() => void>();
let selected: CurrencyCode = "USD";
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const saved = window.localStorage.getItem(KEY);
  if (currencyOptions.some((option) => option.code === saved)) selected = saved as CurrencyCode;
}

export function setCurrency(currency: CurrencyCode) {
  selected = currency;
  window.localStorage.setItem(KEY, currency);
  subscribers.forEach((subscriber) => subscriber());
}

export function convertAmount(amount: number, sourceCurrency: string, targetCurrency: CurrencyCode) {
  const sourceRate = currencyOptions.find((option) => option.code === sourceCurrency)?.rate ?? 1;
  const targetRate = currencyOptions.find((option) => option.code === targetCurrency)?.rate ?? 1;
  return (amount / sourceRate) * targetRate;
}

export function formatInCurrency(
  artwork: Pick<Artwork, "price" | "currency">,
  currency: CurrencyCode,
) {
  if (artwork.price == null) return "Price on request";
  const source = artwork.currency.trim().toUpperCase();
  const canConvert = currencyOptions.some((option) => option.code === source);
  const displayCurrency = canConvert || !/^[A-Z]{3}$/.test(source) ? currency : source;
  const amount = canConvert ? convertAmount(artwork.price, source, currency) : artwork.price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: displayCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function useCurrency() {
  const currency = useSyncExternalStore(
    (subscriber) => {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
    () => {
      load();
      return selected;
    },
    () => "USD" as CurrencyCode,
  );
  return {
    currency,
    setCurrency,
    formatPrice: (artwork: Pick<Artwork, "price" | "currency">) => formatInCurrency(artwork, currency),
  };
}
