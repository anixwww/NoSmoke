import { MoneySettings, PriceTier } from '../types';

export const DAY_MS = 24 * 60 * 60 * 1000;

export interface TimeInterval {
  from: number;
  to: number;
}

/**
 * Calculates total cigarettes avoided across all intervals.
 */
export function calculateCigsAvoided(
  intervals: TimeInterval[],
  money: MoneySettings | null
): number {
  if (!money || money.perDay <= 0) return 0;
  const totalMs = intervals.reduce((acc, int) => acc + Math.max(0, int.to - int.from), 0);
  return (totalMs / DAY_MS) * money.perDay;
}

/**
 * Calculates total money saved across all intervals taking price history into account.
 * For each interval [from, to], if there are price tiers, we split the interval
 * at each tier timestamp and multiply the duration by the rate active during that sub-interval.
 */
export function calculateTotalSaved(
  intervals: TimeInterval[],
  money: MoneySettings | null
): number {
  if (!money || money.perDay <= 0 || money.packSize <= 0) return 0;

  const validIntervals = intervals
    .map((i) => ({ from: Math.min(i.from, i.to), to: Math.max(i.from, i.to) }))
    .filter((i) => i.to > i.from);

  if (validIntervals.length === 0) return 0;

  const history =
    money.priceHistory && money.priceHistory.length > 0
      ? [...money.priceHistory].sort((a, b) => a.timestamp - b.timestamp)
      : null;

  // If no price history, use simple formula
  if (!history || history.length === 0) {
    const totalMs = validIntervals.reduce((acc, i) => acc + (i.to - i.from), 0);
    const cigs = (totalMs / DAY_MS) * money.perDay;
    return (cigs / money.packSize) * money.packPrice;
  }

  // Helper: get pack price active at timestamp t
  const getPriceAt = (t: number): number => {
    // If before first recorded tier, use first tier's price
    if (t < history[0].timestamp) return history[0].packPrice;
    for (let i = history.length - 1; i >= 0; i--) {
      if (t >= history[i].timestamp) {
        return history[i].packPrice;
      }
    }
    return money.packPrice;
  };

  let totalUah = 0;

  for (const interval of validIntervals) {
    // Collect all split points within [interval.from, interval.to]
    const splitPoints = [interval.from];
    for (const tier of history) {
      if (tier.timestamp > interval.from && tier.timestamp < interval.to) {
        splitPoints.push(tier.timestamp);
      }
    }
    splitPoints.push(interval.to);
    splitPoints.sort((a, b) => a - b);

    // Sum up each slice
    for (let j = 0; j < splitPoints.length - 1; j++) {
      const start = splitPoints[j];
      const end = splitPoints[j + 1];
      const durationMs = end - start;
      if (durationMs <= 0) continue;

      const price = getPriceAt(start);
      const sliceCigs = (durationMs / DAY_MS) * money.perDay;
      const sliceUah = (sliceCigs / money.packSize) * price;
      totalUah += sliceUah;
    }
  }

  return totalUah;
}
