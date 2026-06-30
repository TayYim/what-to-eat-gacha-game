import { describe, expect, it } from "vitest";
import { defaultCategories, defaultFoods } from "../data/seed";
import { getRarityWeight } from "./random";
import { createEmptyStoredData, loadStoredData, saveStoredData } from "./storage";

const throwingStorage = {
  getItem() {
    throw new Error("storage blocked");
  },
  setItem() {
    throw new Error("quota exceeded");
  },
  removeItem() {
    throw new Error("storage blocked");
  },
  clear() {
    throw new Error("storage blocked");
  },
  key() {
    return null;
  },
  length: 0,
} satisfies Storage;

describe("storage fallbacks", () => {
  it("loads empty data when localStorage read is blocked", () => {
    expect(loadStoredData(throwingStorage)).toMatchObject({
      storageVersion: 3,
      categories: defaultCategories,
      foods: defaultFoods,
      history: [],
      favorites: [],
    });
  });

  it("returns the payload when localStorage write is blocked", () => {
    const saved = saveStoredData(
      {
        categories: defaultCategories,
        foods: [],
        tags: ["想吃"],
        history: [],
        favorites: ["food-1"],
      },
      throwingStorage,
    );

    expect(saved).toMatchObject({
      storageVersion: 3,
      categories: defaultCategories,
      foods: [],
      tags: ["想吃"],
      history: [],
      favorites: ["food-1"],
    });
  });

  it("falls back to empty data for malformed persisted content", () => {
    expect(createEmptyStoredData()).toMatchObject({
      storageVersion: 3,
      categories: defaultCategories,
      foods: defaultFoods,
      history: [],
      favorites: [],
    });
  });

  it("creates seed data with only 3, 4, and 5 star rarity-derived weights", () => {
    const loaded = createEmptyStoredData();

    expect(new Set(loaded.foods.map((food) => food.rarity))).toEqual(new Set([3, 4, 5]));
    expect(loaded.foods.every((food) => food.weight === getRarityWeight(food.rarity))).toBe(true);
  });

  it("normalizes persisted food rarity and weight to the current hidden defaults", () => {
    const storage = new Map<string, string>();
    const fakeStorage = {
      getItem(key: string) {
        return storage.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        storage.set(key, value);
      },
      removeItem(key: string) {
        storage.delete(key);
      },
      clear() {
        storage.clear();
      },
      key() {
        return null;
      },
      length: 1,
    } satisfies Storage;

    fakeStorage.setItem(
      "what-to-eat-gacha:v1",
      JSON.stringify({
        storageVersion: 2,
        categories: defaultCategories,
        foods: [
          {
            id: "old-low",
            name: "旧低星",
            categoryId: "rice",
            tags: [],
            weight: 999,
            rarity: 2,
            enabled: true,
            createdAt: "2026-06-30T00:00:00.000Z",
          },
          {
            id: "old-high",
            name: "旧高星",
            categoryId: "rice",
            tags: [],
            weight: 999,
            rarity: 5,
            enabled: true,
            createdAt: "2026-06-30T00:00:00.000Z",
          },
        ],
        tags: [],
        history: [],
        favorites: [],
        lastUsedAt: "2026-06-30T00:00:00.000Z",
      }),
    );

    const loaded = loadStoredData(fakeStorage);

    expect(loaded.storageVersion).toBe(3);
    expect(loaded.foods).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "old-low", rarity: 3, weight: getRarityWeight(3) }),
        expect.objectContaining({ id: "old-high", rarity: 5, weight: getRarityWeight(5) }),
      ]),
    );
    expect(loaded.foods.every((food) => !("custom" in food))).toBe(true);
  });

  it("migrates v2 data by refreshing old defaults and preserving user additions", () => {
    const storage = new Map<string, string>();
    const fakeStorage = {
      getItem(key: string) {
        return storage.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        storage.set(key, value);
      },
      removeItem(key: string) {
        storage.delete(key);
      },
      clear() {
        storage.clear();
      },
      key() {
        return null;
      },
      length: 1,
    } satisfies Storage;

    fakeStorage.setItem(
      "what-to-eat-gacha:v1",
      JSON.stringify({
        storageVersion: 2,
        categories: [
          { id: "rice", name: "米饭炒菜", icon: "rice", color: "#ffb020", enabled: true, sortOrder: 1 },
          { id: "user-cat", name: "自家菜单", icon: "fork", color: "#abcdef", enabled: true, sortOrder: 99 },
        ],
        foods: [
          {
            id: "mcdonalds",
            name: "麦当劳",
            categoryId: "fast",
            tags: ["快餐"],
            weight: 94,
            rarity: 3,
            enabled: true,
            createdAt: "2026-06-30T00:00:00.000Z",
          },
          {
            id: "user-food",
            name: "家常鸡腿饭",
            categoryId: "user-cat",
            tags: ["想吃"],
            weight: 5,
            rarity: 4,
            enabled: true,
            createdAt: "2026-06-30T00:00:00.000Z",
            custom: true,
          },
        ],
        tags: ["快餐", "聚餐", "工作餐", "省心", "牛肉", "芝士", "轻松", "想吃"],
        history: [],
        favorites: ["mcdonalds", "user-food"],
        lastUsedAt: "2026-06-30T00:00:00.000Z",
      }),
    );

    const loaded = loadStoredData(fakeStorage);

    expect(loaded.storageVersion).toBe(3);
    expect(loaded.categories.some((category) => category.id === "user-cat")).toBe(true);
    expect(loaded.foods.some((food) => food.id === "mcdonalds")).toBe(false);
    expect(loaded.foods.some((food) => food.name === "麦当劳")).toBe(false);
    expect(loaded.foods.some((food) => food.id === "fried-chicken-leg-set")).toBe(true);
    expect(loaded.foods).toContainEqual(expect.objectContaining({ id: "user-food", name: "家常鸡腿饭" }));
    expect(loaded.tags).toContain("想吃");
    for (const staleTag of ["快餐", "聚餐", "工作餐", "省心", "牛肉", "芝士", "轻松"]) {
      expect(loaded.tags).not.toContain(staleTag);
    }
    expect(loaded.favorites).toEqual(["user-food"]);
    expect(loaded.foods.every((food) => !("custom" in food))).toBe(true);
  });

  it("migrates legacy custom foods while filtering invalid food and history items", () => {
    const storage = new Map<string, string>();
    const fakeStorage = {
      getItem(key: string) {
        return storage.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        storage.set(key, value);
      },
      removeItem(key: string) {
        storage.delete(key);
      },
      clear() {
        storage.clear();
      },
      key() {
        return null;
      },
      length: 1,
    } satisfies Storage;

    fakeStorage.setItem(
      "what-to-eat-gacha:v1",
      JSON.stringify({
        storageVersion: 1,
        customFoods: [
          {
            id: "ok",
            name: "有效食物",
            categoryId: "rice",
            tags: ["米饭"],
            weight: 55,
            rarity: 4,
            enabled: true,
            createdAt: "2026-06-30T00:00:00.000Z",
          },
          {
            id: "bad",
            name: "坏数据",
            categoryId: "rice",
            weight: 55,
            rarity: 4,
            enabled: true,
            createdAt: "2026-06-30T00:00:00.000Z",
          },
        ],
        history: [
          {
            id: "h1",
            label: "有效食物",
            mode: "gacha",
            poolSize: 3,
            createdAt: "2026-06-30T00:00:00.000Z",
            rarity: 4,
          },
          {
            id: "bad-history",
            mode: "gacha",
            poolSize: "three",
          },
        ],
        favorites: ["ok", 42],
        lastUsedAt: "2026-06-30T00:00:00.000Z",
      }),
    );

    const loaded = loadStoredData(fakeStorage);
    expect(loaded.storageVersion).toBe(3);
    expect(loaded.categories.map((category) => category.id)).toEqual(defaultCategories.map((category) => category.id));
    expect(loaded.foods.some((food) => food.id === "ok")).toBe(true);
    expect(loaded.foods.some((food) => food.id === "bad")).toBe(false);
    expect(loaded.foods.some((food) => food.id === defaultFoods[0].id)).toBe(true);
    expect(loaded.tags).toContain("米饭");
    expect(loaded.history.map((entry) => entry.id)).toEqual(["h1"]);
    expect(loaded.favorites).toEqual(["ok"]);
    expect(loaded.foods.every((food) => !("custom" in food))).toBe(true);
  });
});
