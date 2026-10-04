export type Audience = 'adult' | 'child' | 'infant';

export interface Price {
  id: string;
  activityId: string;
  /** key into content/{locale}/ui.json, e.g. "prices.snorkeling.adult" */
  labelKey: string;
  amount: number;
  currency: 'ILS';
  audience: Audience;
  ageFrom: number | null;
  ageTo: number | null;
  unit: 'person' | 'participant';
}

export interface PriceList {
  currency: 'ILS';
  prices: Price[];
}

/** The only way components get prices. Swap the implementation, not the callers. */
export interface PriceRepository {
  getPrices(): Promise<PriceList>;
  getPrice(id: string): Promise<Price>;
}

export class PriceNotFoundError extends Error {
  constructor(id: string) {
    super(`Price "${id}" not found`);
    this.name = 'PriceNotFoundError';
  }
}
