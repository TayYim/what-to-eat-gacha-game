import type { DrawResult, FoodItem } from "./types";

export type RandomSource = () => number;

export const clampWeight = (weight: number): number => {
  if (!Number.isFinite(weight)) {
    return 1;
  }

  return Math.max(1, Math.min(999, Math.round(weight)));
};

export const normalizeWeight = (item: Pick<FoodItem, "weight" | "enabled">): number => {
  if (!item.enabled) {
    return 0;
  }

  return clampWeight(item.weight);
};

export const pickWeightedFood = (
  items: FoodItem[],
  random: RandomSource = Math.random,
): DrawResult | null => {
  const candidates = items.filter((item) => item.enabled);
  if (candidates.length === 0) {
    return null;
  }

  const totalWeight = candidates.reduce((sum, item) => sum + normalizeWeight(item), 0);
  if (totalWeight <= 0) {
    return null;
  }

  const randomValue = Math.min(Math.max(random(), 0), 0.999999999) * totalWeight;
  let cursor = 0;

  for (const item of candidates) {
    cursor += normalizeWeight(item);
    if (randomValue < cursor) {
      return {
        item,
        randomValue,
        totalWeight,
        poolSize: candidates.length,
      };
    }
  }

  const fallback = candidates[candidates.length - 1];
  return {
    item: fallback,
    randomValue,
    totalWeight,
    poolSize: candidates.length,
  };
};

export const pickUniform = <T>(items: T[], random: RandomSource = Math.random): T | null => {
  if (items.length === 0) {
    return null;
  }

  const index = Math.floor(Math.min(Math.max(random(), 0), 0.999999999) * items.length);
  return items[index];
};
