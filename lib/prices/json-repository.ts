import fs from 'node:fs/promises';
import path from 'node:path';
import { PriceNotFoundError, type Price, type PriceList, type PriceRepository } from './types';

interface Options {
  file?: string;
  /** simulated latency range in ms, so loading/error/empty states exist before a real API */
  latency?: { min: number; max: number };
  /** QA: "error" throws, "empty" returns no prices */
  simulate?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Reads /data/prices.json (source of truth until a price API exists). */
export class JsonPriceRepository implements PriceRepository {
  private readonly file: string;
  private readonly latency: { min: number; max: number };
  private readonly simulate: string;

  constructor(opts: Options = {}) {
    this.file = opts.file ?? path.join(process.cwd(), 'data', 'prices.json');
    this.latency = opts.latency ?? { min: 150, max: 400 };
    this.simulate = opts.simulate ?? '';
  }

  private async delay() {
    const { min, max } = this.latency;
    if (max <= 0) return;
    await sleep(min + Math.random() * Math.max(0, max - min));
  }

  async getPrices(): Promise<PriceList> {
    await this.delay();
    if (this.simulate === 'error') throw new Error('Simulated price source failure');
    if (this.simulate === 'empty') return { currency: 'ILS', prices: [] };
    const raw = JSON.parse(await fs.readFile(this.file, 'utf8')) as { currency: 'ILS'; prices: (Price & Record<string, unknown>)[] };
    return {
      currency: raw.currency,
      prices: raw.prices.map(({ id, activityId, labelKey, amount, currency, audience, ageFrom, ageTo, unit }) => ({
        id, activityId, labelKey, amount, currency, audience, ageFrom, ageTo, unit,
      })),
    };
  }

  async getPrice(id: string): Promise<Price> {
    const price = (await this.getPrices()).prices.find((p) => p.id === id);
    if (!price) throw new PriceNotFoundError(id);
    return price;
  }
}
