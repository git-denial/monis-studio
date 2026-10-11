import { DURATION_OPTIONS, PRODUCTS } from "@/data/products";
import type { DurationId, PlanItem, PriceLine, PriceSummary } from "@/types/workspace";

export const findProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const findDuration = (id: DurationId) =>
  DURATION_OPTIONS.find((d) => d.id === id) ?? DURATION_OPTIONS[0];

/** Pure pricing: total = Σ(weeklyRate × qty) × weeks × duration multiplier. */
export function computeSummary(items: PlanItem[], durationId: DurationId): PriceSummary {
  const dur = findDuration(durationId);
  const qty = new Map<string, number>();
  items.forEach((it) => qty.set(it.productId, (qty.get(it.productId) ?? 0) + 1));

  const lines: PriceLine[] = [];
  qty.forEach((q, productId) => {
    const product = findProduct(productId);
    if (!product) return;
    const weekly = product.weeklyRate * q;
    lines.push({ product, qty: q, weekly, total: Math.round(weekly * dur.weeks * dur.multiplier) });
  });

  const weeklySubtotal = lines.reduce((s, l) => s + l.weekly, 0);
  const gross = weeklySubtotal * dur.weeks;
  const total = Math.round(gross * dur.multiplier);
  return { lines, weeklySubtotal, weeks: dur.weeks, multiplier: dur.multiplier, discount: Math.round(gross - total), total };
}

export function weeklyRateFor(items: PlanItem[]): number {
  return items.reduce((s, it) => s + (findProduct(it.productId)?.weeklyRate ?? 0), 0);
}