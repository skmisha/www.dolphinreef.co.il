/**
 * Price repository factory. DATA_SOURCE selects the implementation:
 *   json (default) - JsonPriceRepository over /data/prices.json
 * A future API adds e.g. "api" -> ApiPriceRepository implementing PriceRepository; callers do not change.
 */
import { env } from '@/config/env';
import { JsonPriceRepository } from './json-repository';
import type { Price, PriceRepository } from './types';

export type * from './types';

let instance: PriceRepository | null = null;

export function getPriceRepository(): PriceRepository {
  if (instance) return instance;
  switch (env.dataSource) {
    case 'json':
    default:
      instance = new JsonPriceRepository({ latency: env.priceLatency, simulate: env.priceSimulate });
  }
  return instance;
}

/** Prices for the given ids, in the given order (missing ids are skipped). */
export async function getPricesByIds(ids: string[]): Promise<Price[]> {
  const { prices } = await getPriceRepository().getPrices();
  return ids.map((id) => prices.find((p) => p.id === id)).filter((p): p is Price => !!p);
}

export function formatPrice(amount: number, locale: string, currency = 'ILS'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function lowestPrice(prices: Price[]): Price | null {
  const paid = prices.filter((p) => p.amount > 0);
  return paid.length ? paid.reduce((a, b) => (b.amount < a.amount ? b : a)) : null;
}
