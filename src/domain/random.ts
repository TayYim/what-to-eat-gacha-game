import type { DrawResult, FoodItem } from "./types";
import type { Rarity } from "./types";

export type RandomSource = () => number;

const rarityWeights: Record<Rarity, number> = {
  3: 94,
  4: 5,
  5: 1,
};

export const clampWeight = (weight: number): number => {
  if (!Number.isFinite(weight)) {
    return 1;
  }

  return Math.max(1, Math.min(999, Math.round(weight)));
};

export const normalizeRarity = (rarity: unknown): Rarity => {
  if (typeof rarity !== "number" || !Number.isFinite(rarity)) {
    return 3;
  }

  if (rarity >= 5) {
    return 5;
  }

  if (rarity >= 4) {
    return 4;
  }

  return 3;
};

export const getRarityWeight = (rarity: Rarity | number): number => rarityWeights[normalizeRarity(rarity)];

export const normalizeWeight = (item: Pick<FoodItem, "rarity" | "enabled">): number => {
  if (!item.enabled) {
    return 0;
  }

  return getRarityWeight(item.rarity);
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
