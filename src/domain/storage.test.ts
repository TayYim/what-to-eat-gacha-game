import { describe, expect, it } from "vitest";
import { defaultCategories, defaultFoods } from "../data/seed";
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
      storageVersion: 2,
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
        tags: ["米饭"],
        history: [],
        favorites: ["food-1"],
      },
      throwingStorage,
    );

    expect(saved).toMatchObject({
      storageVersion: 2,
      categories: defaultCategories,
      foods: [],
      tags: ["米饭"],
      history: [],
      favorites: ["food-1"],
    });
  });

  it("falls back to empty data for malformed persisted content", () => {
    expect(createEmptyStoredData()).toMatchObject({
      storageVersion: 2,
      categories: defaultCategories,
      foods: defaultFoods,
      history: [],
      favorites: [],
    });
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
            custom: true,
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
    expect(loaded.storageVersion).toBe(2);
    expect(loaded.categories.map((category) => category.id)).toEqual(defaultCategories.map((category) => category.id));
    expect(loaded.foods.some((food) => food.id === "ok")).toBe(true);
    expect(loaded.foods.some((food) => food.id === "bad")).toBe(false);
    expect(loaded.foods.some((food) => food.id === defaultFoods[0].id)).toBe(true);
    expect(loaded.tags).toContain("米饭");
    expect(loaded.history.map((entry) => entry.id)).toEqual(["h1"]);
    expect(loaded.favorites).toEqual(["ok"]);
  });
});
