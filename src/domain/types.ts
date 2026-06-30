export type Rarity = 3 | 4 | 5;

export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  sortOrder: number;
}

export interface FoodItem {
  id: string;
  name: string;
  categoryId: string;
  tags: string[];
  weight: number;
  rarity: Rarity;
  enabled: boolean;
  notes?: string;
  createdAt: string;
  custom?: boolean;
}

export interface FoodFilterState {
  selectedCategoryIds: string[];
  includedTags: string[];
  excludedTags: string[];
  excludedFoodIds: string[];
}

export interface PickHistoryEntry {
  id: string;
  foodId?: string;
  categoryId?: string;
  label: string;
  mode: "category-wheel" | "food-wheel" | "gacha";
  poolSize: number;
  createdAt: string;
  rarity?: Rarity;
}

export interface StoredAppData {
  storageVersion: 2;
  categories: FoodCategory[];
  foods: FoodItem[];
  tags: string[];
  history: PickHistoryEntry[];
  favorites: string[];
  lastUsedAt: string;
}

export interface LegacyStoredAppData {
  storageVersion: 1;
  customFoods: FoodItem[];
  history: PickHistoryEntry[];
  favorites: string[];
  lastUsedAt: string;
}

export interface DrawResult {
  item: FoodItem;
  randomValue: number;
  totalWeight: number;
  poolSize: number;
}
