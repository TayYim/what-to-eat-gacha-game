import type { Category, Food, Rarity, TierCode } from "../data/food-data";
import { rarityWeight, tierCode } from "../data/food-data";

export interface Tier {
  code: TierCode | "N";
  color: string;
  glow: string;
  label: string;
}

export interface Draw {
  item: Food;
}

export interface CreateDrawsOptions {
  count: 1 | 10;
  pool: Food[];
  tenPullGuarantee: boolean;
  random?: () => number;
}

export interface WheelRotationOptions {
  currentRotation: number;
  entryCount: number;
  targetIndex: number;
}

export interface WheelMarkerSize {
  markerSize: number;
  iconSize: number;
  radius: number;
}

export interface GlyphPoint {
  x: number;
  y: number;
  radius: number;
}

export interface GlyphData {
  path: string;
  nodes: GlyphPoint[];
}

export const hashStr = (value: string): number => {
  let hash = 2166136261;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const prng = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const createGlyphData = (seed: string): GlyphData => {
  const random = prng(hashStr(seed));
  const count = 4 + Math.floor(random() * 3);
  const points = Array.from({ length: count }, () => [16 + random() * 68, 16 + random() * 68] as const);
  const path = points
    .map((point, index) => `${index ? "L" : "M"}${point[0].toFixed(1)} ${point[1].toFixed(1)}`)
    .join(" ");
  const nodes = points.map((point, index) => ({
    x: point[0],
    y: point[1],
    radius: index === 0 ? 3.6 : 1.8 + random() * 1.7,
  }));

  return { path, nodes };
};

export const rarityTier = (rarity: number): Tier => {
  if (rarity >= 5) {
    return { code: "SSR", color: "#ffce6b", glow: "rgba(255,206,107,.6)", label: "传说" };
  }
  if (rarity >= 4) {
    return { code: "SR", color: "#c08cff", glow: "rgba(192,140,255,.55)", label: "稀有" };
  }
  if (rarity >= 3) {
    return { code: "R", color: "#6cc6ff", glow: "rgba(108,198,255,.5)", label: "优良" };
  }
  return { code: "N", color: "#aab8d0", glow: "rgba(170,184,208,.4)", label: "普通" };
};

export const activePool = (foods: Food[], active: Record<string, boolean>): Food[] =>
  foods.filter((food) => active[food.cat] !== false);

export const pickWeighted = (pool: Food[], random: () => number = Math.random): Food | null => {
  if (pool.length === 0) {
    return null;
  }

  const total = pool.reduce((sum, food) => sum + rarityWeight(food.r), 0);
  let cursor = random() * total;
  for (const food of pool) {
    cursor -= rarityWeight(food.r);
    if (cursor <= 0) {
      return food;
    }
  }
  return pool[pool.length - 1];
};

export const createDraws = ({
  count,
  pool,
  tenPullGuarantee,
  random = Math.random,
}: CreateDrawsOptions): Draw[] => {
  const draws = Array.from({ length: count }, () => pickWeighted(pool, random))
    .filter((item): item is Food => item !== null)
    .map((item) => ({ item }));

  if (count === 10 && tenPullGuarantee && draws.length === 10 && draws.every((draw) => draw.item.r < 4)) {
    const fourPlus = pool.filter((food) => food.r >= 4);
    const guaranteed = pickWeighted(fourPlus, random);
    if (guaranteed) {
      draws[9] = { item: guaranteed };
    }
  }

  return draws;
};

export const bestDraw = (draws: Draw[]): Draw | null => {
  if (draws.length === 0) {
    return null;
  }
  return draws.reduce((best, draw) => (draw.item.r > best.item.r ? draw : best), draws[0]);
};

export const createActiveMap = (categories: Category[]): Record<string, boolean> =>
  Object.fromEntries(categories.map((category) => [category.id, true]));

export const getWheelMarkerSize = (entryCount: number): WheelMarkerSize => {
  const count = Math.max(entryCount, 1);
  const markerSize = Math.max(13, Math.min(42, Math.floor(660 / count)));
  return {
    markerSize,
    iconSize: Math.round(markerSize * 0.56),
    radius: Math.round(134 - markerSize / 2 - 5),
  };
};

export const computeWheelRotation = ({
  currentRotation,
  entryCount,
  targetIndex,
}: WheelRotationOptions): number => {
  const count = Math.max(entryCount, 1);
  const safeIndex = Math.max(0, Math.min(targetIndex, count - 1));
  const slice = 360 / count;
  const center = slice * safeIndex + slice / 2;
  const base = currentRotation - (currentRotation % 360);
  return base + 360 * 5 + (360 - center);
};

export const categoryById = (categories: Category[], categoryId: string): Category | undefined =>
  categories.find((category) => category.id === categoryId);

export const stars = (rarity: Rarity): boolean[] =>
  Array.from({ length: 5 }, (_, index) => index < rarity);

export { rarityWeight, tierCode };
