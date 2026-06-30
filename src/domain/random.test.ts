import { describe, expect, it } from "vitest";
import type { FoodItem } from "./types";
import { getRarityWeight, pickUniform, pickWeightedFood } from "./random";

const foods: FoodItem[] = [
  {
    id: "a",
    name: "A",
    categoryId: "rice",
    tags: [],
    weight: 1,
    rarity: 3,
    enabled: true,
    createdAt: "2026-06-30T00:00:00.000Z",
  },
  {
    id: "b",
    name: "B",
    categoryId: "rice",
    tags: [],
    weight: 999,
    rarity: 5,
    enabled: true,
    createdAt: "2026-06-30T00:00:00.000Z",
  },
  {
    id: "c",
    name: "C",
    categoryId: "rice",
    tags: [],
    weight: 9999,
    rarity: 5,
    enabled: false,
    createdAt: "2026-06-30T00:00:00.000Z",
  },
];

describe("pickWeightedFood", () => {
  it("uses gacha-style default weights derived from rarity", () => {
    expect(getRarityWeight(3)).toBe(94);
    expect(getRarityWeight(4)).toBe(5);
    expect(getRarityWeight(5)).toBe(1);
  });

  it("selects by cumulative enabled rarity weights", () => {
    expect(pickWeightedFood(foods, () => 0.01)?.item.id).toBe("a");
    expect(pickWeightedFood(foods, () => 0.98)?.item.id).toBe("a");
    expect(pickWeightedFood(foods, () => 0.995)?.item.id).toBe("b");
  });

  it("ignores disabled items", () => {
    expect(pickWeightedFood(foods, () => 0.999999)?.item.id).toBe("b");
  });

  it("returns null for an empty candidate set", () => {
    expect(pickWeightedFood([])).toBeNull();
    expect(pickWeightedFood(foods.map((food) => ({ ...food, enabled: false })))).toBeNull();
  });
});

describe("pickUniform", () => {
  it("selects a stable index from a random source", () => {
    expect(pickUniform(["a", "b", "c"], () => 0)).toBe("a");
    expect(pickUniform(["a", "b", "c"], () => 0.66)).toBe("b");
    expect(pickUniform(["a", "b", "c"], () => 0.999999)).toBe("c");
  });
});
