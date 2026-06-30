import { defaultCategories, defaultFoods, starterTags } from "../data/seed";
import type { FoodCategory, FoodItem, LegacyStoredAppData, PickHistoryEntry, Rarity, StoredAppData } from "./types";
import { getAllTags } from "./filters";
import { getRarityWeight, normalizeRarity } from "./random";

const key = "what-to-eat-gacha:v1";
const version = 2 as const;

const cloneCategory = (category: FoodCategory): FoodCategory => ({ ...category });
const cloneFood = (food: FoodItem): FoodItem => ({
  ...food,
  tags: [...food.tags],
});

const createSeedTags = (foods: FoodItem[]) =>
  [...new Set([...starterTags.filter((tag) => tag !== "全部"), ...getAllTags(foods)])].sort((a, b) =>
    a.localeCompare(b, "zh-Hans-CN"),
  );

export const createEmptyStoredData = (): StoredAppData => ({
  storageVersion: version,
  categories: defaultCategories.map(cloneCategory),
  foods: defaultFoods.map(cloneFood),
  tags: createSeedTags(defaultFoods),
  history: [],
  favorites: [],
  lastUsedAt: new Date().toISOString(),
});

export const isStoredAppData = (value: unknown): value is StoredAppData => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Partial<StoredAppData>;
  return (
    record.storageVersion === version &&
    Array.isArray(record.categories) &&
    Array.isArray(record.foods) &&
    Array.isArray(record.tags) &&
    Array.isArray(record.history) &&
    Array.isArray(record.favorites) &&
    typeof record.lastUsedAt === "string"
  );
};

const isLegacyStoredAppData = (value: unknown): value is LegacyStoredAppData => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Partial<LegacyStoredAppData>;
  return (
    record.storageVersion === 1 &&
    Array.isArray(record.customFoods) &&
    Array.isArray(record.history) &&
    Array.isArray(record.favorites) &&
    typeof record.lastUsedAt === "string"
  );
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStoredRarity = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;

const toFoodItem = (value: unknown): FoodItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.categoryId === "string" &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === "string") &&
    typeof value.weight === "number" &&
    Number.isFinite(value.weight) &&
    isStoredRarity(value.rarity) &&
    typeof value.enabled === "boolean" &&
    typeof value.createdAt === "string" &&
    (value.notes === undefined || typeof value.notes === "string") &&
    (value.custom === undefined || typeof value.custom === "boolean")
  ) {
    const rarity = normalizeRarity(value.rarity);
    return {
      id: value.id,
      name: value.name,
      categoryId: value.categoryId,
      tags: value.tags,
      weight: getRarityWeight(rarity),
      rarity,
      enabled: value.enabled,
      notes: value.notes,
      createdAt: value.createdAt,
      custom: value.custom,
    };
  }

  return null;
};

const isFoodCategory = (value: unknown): value is FoodCategory => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.icon === "string" &&
    typeof value.color === "string" &&
    typeof value.enabled === "boolean" &&
    typeof value.sortOrder === "number" &&
    Number.isFinite(value.sortOrder)
  );
};

const toHistoryEntry = (value: unknown): PickHistoryEntry | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    (value.mode === "category-wheel" || value.mode === "food-wheel" || value.mode === "gacha") &&
    typeof value.poolSize === "number" &&
    Number.isFinite(value.poolSize) &&
    typeof value.createdAt === "string" &&
    (value.foodId === undefined || typeof value.foodId === "string") &&
    (value.categoryId === undefined || typeof value.categoryId === "string") &&
    (value.rarity === undefined || isStoredRarity(value.rarity))
  ) {
    return {
      id: value.id,
      foodId: value.foodId,
      categoryId: value.categoryId,
      label: value.label,
      mode: value.mode,
      poolSize: value.poolSize,
      createdAt: value.createdAt,
      rarity: value.rarity === undefined ? undefined : normalizeRarity(value.rarity),
    };
  }

  return null;
};

const isPresent = <T>(value: T | null): value is T => value !== null;

const sanitizeStoredData = (data: StoredAppData): StoredAppData => ({
  ...data,
  categories: data.categories.filter(isFoodCategory),
  foods: data.foods.map(toFoodItem).filter(isPresent),
  tags: data.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0),
  history: data.history.map(toHistoryEntry).filter(isPresent).slice(0, 10),
  favorites: data.favorites.filter((favorite): favorite is string => typeof favorite === "string"),
});

const migrateLegacyData = (data: LegacyStoredAppData): StoredAppData => {
  const customFoods = data.customFoods.map(toFoodItem).filter(isPresent);
  const foods = [...customFoods, ...defaultFoods.map(cloneFood)];

  return {
    storageVersion: version,
    categories: defaultCategories.map(cloneCategory),
    foods,
    tags: createSeedTags(foods),
    history: data.history.map(toHistoryEntry).filter(isPresent).slice(0, 10),
    favorites: data.favorites.filter((favorite): favorite is string => typeof favorite === "string"),
    lastUsedAt: data.lastUsedAt,
  };
};

export const loadStoredData = (storage: Storage = window.localStorage): StoredAppData => {
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return createEmptyStoredData();
    }

    const parsed = JSON.parse(raw) as unknown;
    if (isStoredAppData(parsed)) {
      return sanitizeStoredData(parsed);
    }

    if (isLegacyStoredAppData(parsed)) {
      return migrateLegacyData(parsed);
    }

    return createEmptyStoredData();
  } catch {
    return createEmptyStoredData();
  }
};

export const saveStoredData = (
  data: Pick<StoredAppData, "categories" | "foods" | "tags" | "history" | "favorites">,
  storage: Storage = window.localStorage,
): StoredAppData => {
  const payload: StoredAppData = {
    storageVersion: version,
    categories: data.categories,
    foods: data.foods,
    tags: data.tags,
    history: data.history.slice(0, 10),
    favorites: data.favorites,
    lastUsedAt: new Date().toISOString(),
  };

  try {
    storage.setItem(key, JSON.stringify(payload));
  } catch {
    // Browser storage can be blocked, private, or quota-full. Keep the app usable.
  }

  return payload;
};

export const upsertCustomFood = (foods: FoodItem[], food: FoodItem): FoodItem[] => {
  const existing = foods.findIndex((item) => item.id === food.id);
  if (existing === -1) {
    return [food, ...foods];
  }

  return foods.map((item) => (item.id === food.id ? food : item));
};

export const addHistoryEntry = (
  history: PickHistoryEntry[],
  entry: PickHistoryEntry,
): PickHistoryEntry[] => [entry, ...history].slice(0, 10);
