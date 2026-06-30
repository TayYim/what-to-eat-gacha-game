import { describe, expect, it } from "vitest";
import { defaultCategories, defaultFoods, starterTags } from "./seed";
import { getRarityWeight } from "../domain/random";

const brandNames = [
  "麦当劳",
  "肯德基",
  "必胜客",
  "星巴克",
  "瑞幸",
  "库迪",
  "喜茶",
  "奈雪",
  "蜜雪冰城",
  "一点点",
  "茶百道",
  "古茗",
  "霸王茶姬",
  "海底捞",
  "呷哺",
  "达美乐",
  "汉堡王",
  "德克士",
  "塔斯汀",
  "华莱士",
  "真功夫",
  "乡村基",
  "吉野家",
  "赛百味",
  "罗森",
  "全家",
  "7-Eleven",
  "711",
];

const categoryConceptTags = new Set([
  "早餐",
  "早点",
  "米饭",
  "便当",
  "中式",
  "菜系",
  "粉面",
  "馄饨",
  "饺子",
  "包点",
  "麻辣烫",
  "冒菜",
  "火锅",
  "香锅",
  "烧烤",
  "快餐",
  "烤肉",
  "汉堡",
  "炸鸡",
  "西餐",
  "披萨",
  "日料",
  "韩料",
  "日韩",
  "日韩料理",
  "轻食",
  "健康餐",
  "粥",
  "汤",
  "炖品",
  "海鲜",
  "河鲜",
  "小吃",
  "夜宵",
  "茶饮",
  "咖啡",
  "甜品",
  "烘焙",
  "水果",
]);

describe("default food catalog", () => {
  it("covers every default category with expanded concrete foods", () => {
    expect(defaultCategories.length).toBeGreaterThanOrEqual(18);
    expect(defaultFoods.length).toBeGreaterThanOrEqual(defaultCategories.length * 6);

    for (const category of defaultCategories) {
      expect(defaultFoods.filter((food) => food.categoryId === category.id).length).toBeGreaterThanOrEqual(6);
    }
  });

  it("uses stable unique ids and valid category references", () => {
    const categoryIds = new Set(defaultCategories.map((category) => category.id));
    expect(categoryIds.size).toBe(defaultCategories.length);
    expect(new Set(defaultFoods.map((food) => food.id)).size).toBe(defaultFoods.length);
    expect(new Set(defaultFoods.map((food) => food.name)).size).toBe(defaultFoods.length);
    expect(defaultFoods.every((food) => categoryIds.has(food.categoryId))).toBe(true);
  });

  it("keeps food names generic and brand-free", () => {
    const names = defaultFoods.map((food) => food.name).join("、");
    for (const brandName of brandNames) {
      expect(names).not.toContain(brandName);
    }
  });

  it("keeps tags distinct from category concepts", () => {
    const allTags = new Set([...starterTags, ...defaultFoods.flatMap((food) => food.tags)]);
    const categoryNames = new Set(defaultCategories.map((category) => category.name));

    for (const tag of allTags) {
      expect(categoryNames.has(tag)).toBe(false);
      expect(categoryConceptTags.has(tag)).toBe(false);
    }
  });

  it("assigns health-based rarity and hidden weights consistently", () => {
    expect(new Set(defaultFoods.map((food) => food.rarity))).toEqual(new Set([3, 4, 5]));
    expect(defaultFoods.every((food) => food.weight === getRarityWeight(food.rarity))).toBe(true);

    const rarityByName = new Map(defaultFoods.map((food) => [food.name, food.rarity]));
    expect(rarityByName.get("清蒸鱼套餐")).toBe(3);
    expect(rarityByName.get("鸡胸肉沙拉")).toBe(3);
    expect(rarityByName.get("黄焖鸡米饭")).toBe(4);
    expect(rarityByName.get("炸鸡腿套餐")).toBe(5);
    expect(rarityByName.get("牛肉火锅")).toBe(5);
    expect(rarityByName.get("珍珠奶茶")).toBe(5);
  });

  it("only exposes starter tags that match at least one default food", () => {
    const foodTags = new Set(defaultFoods.flatMap((food) => food.tags));
    expect(starterTags.every((tag) => foodTags.has(tag))).toBe(true);
  });
});
