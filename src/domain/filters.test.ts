import { describe, expect, it } from "vitest";
import { defaultFoods } from "../data/seed";
import { emptyFilterState, filterFoods, parseTags } from "./filters";

describe("parseTags", () => {
  it("splits Chinese and western delimiters and removes duplicates", () => {
    expect(parseTags("米饭, 热乎、米饭 外卖")).toEqual(["米饭", "热乎", "外卖"]);
  });
});

describe("filterFoods", () => {
  it("filters by selected categories", () => {
    const results = filterFoods(defaultFoods, {
      ...emptyFilterState,
      selectedCategoryIds: ["fast"],
    });

    expect(results.map((food) => food.id)).toContain("fried-chicken-leg-set");
    expect(results.every((food) => food.categoryId === "fast")).toBe(true);
  });

  it("includes matching tags and excludes blocked tags", () => {
    const results = filterFoods(defaultFoods, {
      ...emptyFilterState,
      includedTags: ["下饭"],
      excludedTags: ["麻辣"],
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((food) => food.tags.includes("下饭"))).toBe(true);
    expect(results.every((food) => !food.tags.includes("麻辣"))).toBe(true);
  });
});
