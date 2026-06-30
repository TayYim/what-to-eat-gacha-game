import type { FoodFilterState, FoodItem } from "./types";

export const emptyFilterState: FoodFilterState = {
  selectedCategoryIds: [],
  includedTags: [],
  excludedTags: [],
  excludedFoodIds: [],
};

export const normalizeTag = (tag: string): string => tag.trim().replace(/\s+/g, "");

export const parseTags = (value: string): string[] => {
  const tags = value
    .split(/[,\uFF0C、\s]+/)
    .map(normalizeTag)
    .filter(Boolean);

  return [...new Set(tags)];
};

export const getAllTags = (foods: FoodItem[]): string[] => {
  const set = new Set<string>();
  foods.forEach((food) => food.tags.forEach((tag) => set.add(tag)));
  return [...set].sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
};

export const filterFoods = (foods: FoodItem[], filters: FoodFilterState): FoodItem[] => {
  const selectedCategories = new Set(filters.selectedCategoryIds);
  const includedTags = new Set(filters.includedTags);
  const excludedTags = new Set(filters.excludedTags);
  const excludedFoods = new Set(filters.excludedFoodIds);

  return foods.filter((food) => {
    if (!food.enabled || excludedFoods.has(food.id)) {
      return false;
    }

    if (selectedCategories.size > 0 && !selectedCategories.has(food.categoryId)) {
      return false;
    }

    if (includedTags.size > 0 && !food.tags.some((tag) => includedTags.has(tag))) {
      return false;
    }

    if (food.tags.some((tag) => excludedTags.has(tag))) {
      return false;
    }

    return true;
  });
};
