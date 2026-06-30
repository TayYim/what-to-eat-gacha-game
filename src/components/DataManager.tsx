import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Search, Star, Trash2, X } from "lucide-react";
import type { FoodCategory, FoodItem, Rarity } from "../domain/types";
import { parseTags } from "../domain/filters";
import { getRarityWeight } from "../domain/random";
import { CategoryIcon } from "./CategoryIcon";
import { RarityStars } from "./RarityStars";

type DataView = "foods" | "categories" | "tags";
type FoodSourceFilter = "all" | "custom" | "seed";
type SortKey = "name" | "category" | "rarity" | "createdAt" | "sortOrder" | "usage";

interface DataManagerProps {
  categories: FoodCategory[];
  foods: FoodItem[];
  tags: string[];
  favorites: string[];
  filteredCount: number;
  onUpsertFood: (food: FoodItem) => void;
  onDeleteFood: (foodId: string) => void;
  onToggleFavorite: (foodId: string) => void;
  onUpsertCategory: (category: FoodCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddTag: (tag: string) => void;
  onRenameTag: (oldTag: string, newTag: string) => void;
  onDeleteTag: (tag: string) => void;
}

interface FoodDraft {
  name: string;
  categoryId: string;
  tags: string;
  rarity: Rarity;
  notes: string;
  enabled: boolean;
}

interface CategoryDraft {
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  sortOrder: number;
}

const iconOptions = ["rice", "flame", "grill", "leaf", "noodle", "ticket", "card", "fork", "bolt", "spark"];

const createId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
};

const emptyFoodDraft = (categoryId: string): FoodDraft => ({
  name: "",
  categoryId,
  tags: "",
  rarity: 3,
  notes: "",
  enabled: true,
});

const emptyCategoryDraft = (sortOrder: number): CategoryDraft => ({
  name: "",
  icon: "fork",
  color: "#00d9ff",
  enabled: true,
  sortOrder,
});

const normalizeSearch = (value: string) => value.trim().toLocaleLowerCase("zh-Hans-CN");

export function DataManager({
  categories,
  foods,
  tags,
  favorites,
  filteredCount,
  onUpsertFood,
  onDeleteFood,
  onToggleFavorite,
  onUpsertCategory,
  onDeleteCategory,
  onAddTag,
  onRenameTag,
  onDeleteTag,
}: DataManagerProps) {
  const [view, setView] = useState<DataView>("foods");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState<FoodSourceFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [foodDraft, setFoodDraft] = useState<FoodDraft>(() => emptyFoodDraft(categories[0]?.id ?? ""));
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(() => emptyCategoryDraft(categories.length + 1));
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");

  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const tagUsage = useMemo(() => {
    const usage = new Map<string, number>();
    tags.forEach((tag) => usage.set(tag, 0));
    foods.forEach((food) => food.tags.forEach((tag) => usage.set(tag, (usage.get(tag) ?? 0) + 1)));
    return usage;
  }, [foods, tags]);

  const normalizedQuery = normalizeSearch(query);
  const activeSortOptions = useMemo(() => {
    if (view === "foods") {
      return [
        { value: "name", label: "名称" },
        { value: "category", label: "大类" },
        { value: "rarity", label: "星级" },
        { value: "createdAt", label: "创建时间" },
      ] satisfies { value: SortKey; label: string }[];
    }

    if (view === "categories") {
      return [
        { value: "sortOrder", label: "顺序" },
        { value: "name", label: "名称" },
        { value: "usage", label: "食物数量" },
      ] satisfies { value: SortKey; label: string }[];
    }

    return [
      { value: "name", label: "名称" },
      { value: "usage", label: "使用次数" },
    ] satisfies { value: SortKey; label: string }[];
  }, [view]);

  const activeSortKey = activeSortOptions.some((option) => option.value === sortKey)
    ? sortKey
    : activeSortOptions[0].value;
  const sortFactor = sortDirection === "asc" ? 1 : -1;

  useEffect(() => {
    if (!foodDraft.categoryId && categories[0]) {
      setFoodDraft((current) => ({ ...current, categoryId: categories[0].id }));
    }
  }, [categories, foodDraft.categoryId]);

  const visibleFoods = useMemo(() => {
    return foods
      .filter((food) => {
        const category = categoryById.get(food.categoryId);
        const haystack = normalizeSearch([food.name, category?.name ?? "未分类", food.notes ?? "", ...food.tags].join(" "));

        if (normalizedQuery && !haystack.includes(normalizedQuery)) return false;
        if (categoryFilter !== "all" && food.categoryId !== categoryFilter) return false;
        if (tagFilter !== "all" && !food.tags.includes(tagFilter)) return false;
        if (sourceFilter === "custom" && !food.custom) return false;
        if (sourceFilter === "seed" && food.custom) return false;
        return true;
      })
      .sort((a, b) => {
        if (activeSortKey === "category") {
          return (
            ((categoryById.get(a.categoryId)?.name ?? "").localeCompare(
              categoryById.get(b.categoryId)?.name ?? "",
              "zh-Hans-CN",
            ) || a.name.localeCompare(b.name, "zh-Hans-CN")) * sortFactor
          );
        }

        if (activeSortKey === "rarity") return ((a.rarity - b.rarity) || a.name.localeCompare(b.name, "zh-Hans-CN")) * sortFactor;
        if (activeSortKey === "createdAt") return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * sortFactor;
        return a.name.localeCompare(b.name, "zh-Hans-CN") * sortFactor;
      });
  }, [activeSortKey, categoryById, categoryFilter, foods, normalizedQuery, sortFactor, sourceFilter, tagFilter]);

  const visibleCategories = useMemo(() => {
    return categories
      .filter((category) => normalizeSearch([category.name, category.icon].join(" ")).includes(normalizedQuery))
      .sort((a, b) => {
        if (activeSortKey === "usage") {
          const countA = foods.filter((food) => food.categoryId === a.id).length;
          const countB = foods.filter((food) => food.categoryId === b.id).length;
          return ((countA - countB) || a.name.localeCompare(b.name, "zh-Hans-CN")) * sortFactor;
        }

        if (activeSortKey === "sortOrder") return ((a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name, "zh-Hans-CN")) * sortFactor;
        return a.name.localeCompare(b.name, "zh-Hans-CN") * sortFactor;
      });
  }, [activeSortKey, categories, foods, normalizedQuery, sortFactor]);

  const visibleTags = useMemo(() => {
    return tags
      .filter((tag) => normalizeSearch(tag).includes(normalizedQuery))
      .sort((a, b) => {
        if (activeSortKey === "usage") {
          return (((tagUsage.get(a) ?? 0) - (tagUsage.get(b) ?? 0)) || a.localeCompare(b, "zh-Hans-CN")) * sortFactor;
        }

        return a.localeCompare(b, "zh-Hans-CN") * sortFactor;
      });
  }, [activeSortKey, normalizedQuery, sortFactor, tagUsage, tags]);

  const resetFoodForm = () => {
    setEditingFoodId(null);
    setFoodDraft(emptyFoodDraft(categories[0]?.id ?? ""));
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryDraft(emptyCategoryDraft(categories.length + 1));
  };

  const resetTagForm = () => {
    setEditingTag(null);
    setTagDraft("");
  };

  const submitFood = (event: FormEvent) => {
    event.preventDefault();
    const name = foodDraft.name.trim();
    if (!name || !foodDraft.categoryId) return;

    const existing = editingFoodId ? foods.find((food) => food.id === editingFoodId) : undefined;
    onUpsertFood({
      id: existing?.id ?? createId("food"),
      name,
      categoryId: foodDraft.categoryId,
      tags: parseTags(foodDraft.tags),
      weight: getRarityWeight(foodDraft.rarity),
      rarity: foodDraft.rarity,
      enabled: foodDraft.enabled,
      notes: foodDraft.notes.trim() || undefined,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      custom: true,
    });
    resetFoodForm();
  };

  const submitCategory = (event: FormEvent) => {
    event.preventDefault();
    const name = categoryDraft.name.trim();
    if (!name) return;

    onUpsertCategory({
      id: editingCategoryId ?? createId("cat"),
      name,
      icon: categoryDraft.icon,
      color: categoryDraft.color,
      enabled: categoryDraft.enabled,
      sortOrder: Number.isFinite(categoryDraft.sortOrder) ? categoryDraft.sortOrder : categories.length + 1,
    });
    resetCategoryForm();
  };

  const submitTag = (event: FormEvent) => {
    event.preventDefault();
    const nextTag = parseTags(tagDraft)[0] ?? "";
    if (!nextTag) return;

    if (editingTag) {
      onRenameTag(editingTag, nextTag);
    } else {
      onAddTag(nextTag);
    }
    resetTagForm();
  };

  const editFood = (food: FoodItem) => {
    setView("foods");
    setEditingFoodId(food.id);
    setFoodDraft({
      name: food.name,
      categoryId: food.categoryId,
      tags: food.tags.join(" "),
      rarity: food.rarity,
      notes: food.notes ?? "",
      enabled: food.enabled,
    });
  };

  const editCategory = (category: FoodCategory) => {
    setView("categories");
    setEditingCategoryId(category.id);
    setCategoryDraft({
      name: category.name,
      icon: category.icon,
      color: category.color,
      enabled: category.enabled,
      sortOrder: category.sortOrder,
    });
  };

  const editTag = (tag: string) => {
    setView("tags");
    setEditingTag(tag);
    setTagDraft(tag);
  };

  return (
    <section className="stage data-manager" aria-labelledby="data-manager-title">
      <div className="stage-heading data-heading">
        <div>
          <p className="eyebrow">数据管理</p>
          <h2 id="data-manager-title">管理大类、标签和具体食物</h2>
        </div>
        <div className="data-summary" aria-label="数据概览">
          <span><strong>{categories.length}</strong>大类</span>
          <span><strong>{tags.length}</strong>标签</span>
          <span><strong>{foods.length}</strong>食物</span>
          <span><strong>{filteredCount}</strong>当前候选</span>
        </div>
      </div>

      <div className="data-tabs" aria-label="管理对象">
        {[
          { value: "foods", label: "具体食物" },
          { value: "categories", label: "大类" },
          { value: "tags", label: "标签" },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={view === tab.value ? "is-active" : ""}
            aria-pressed={view === tab.value}
            onClick={() => setView(tab.value as DataView)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="manager-toolbar">
        <label className="manager-search">
          <span><Search aria-hidden="true" />搜索</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={view === "foods" ? "搜索名称、标签、备注" : "搜索名称"}
          />
        </label>

        {view === "foods" && (
          <>
            <label>
              大类筛选
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">全部大类</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              标签筛选
              <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
                <option value="all">全部标签</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </label>
            <label>
              来源筛选
              <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as FoodSourceFilter)}>
                <option value="all">全部来源</option>
                <option value="custom">自定义</option>
                <option value="seed">内置</option>
              </select>
            </label>
          </>
        )}

        <label>
          排序
          <select value={activeSortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
            {activeSortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <button type="button" className="ghost-action sort-toggle" onClick={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}>
          {sortDirection === "asc" ? "升序" : "降序"}
        </button>
        {query && (
          <button type="button" className="icon-action" aria-label="清空搜索" onClick={() => setQuery("")}>
            <X aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="data-workspace">
        <div className="manager-editor" aria-label="编辑区">
          {view === "foods" && (
            <form className="manager-form" onSubmit={submitFood}>
              <div className="editor-title">
                <h3>{editingFoodId ? "编辑具体食物" : "新增具体食物"}</h3>
                {editingFoodId && <button type="button" className="ghost-action" onClick={resetFoodForm}>取消编辑</button>}
              </div>
              <label>名称<input value={foodDraft.name} onChange={(event) => setFoodDraft((current) => ({ ...current, name: event.target.value }))} placeholder="例如：番茄牛腩饭" /></label>
              <label>
                所属大类
                <select value={foodDraft.categoryId} onChange={(event) => setFoodDraft((current) => ({ ...current, categoryId: event.target.value }))} disabled={categories.length === 0}>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label className="wide">标签<input value={foodDraft.tags} onChange={(event) => setFoodDraft((current) => ({ ...current, tags: event.target.value }))} placeholder="用逗号、顿号或空格分隔" /></label>
              <fieldset>
                <legend>星级</legend>
                <div className="rating-buttons">
                  {([3, 4, 5] as Rarity[]).map((level) => (
                    <button key={level} type="button" className={foodDraft.rarity === level ? "is-active" : ""} aria-pressed={foodDraft.rarity === level} onClick={() => setFoodDraft((current) => ({ ...current, rarity: level }))}>{level}</button>
                  ))}
                </div>
              </fieldset>
              <label className="wide">备注<input value={foodDraft.notes} onChange={(event) => setFoodDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="可选" /></label>
              <label className="toggle-row"><input type="checkbox" checked={foodDraft.enabled} onChange={(event) => setFoodDraft((current) => ({ ...current, enabled: event.target.checked }))} />参与随机</label>
              <button type="submit" className="primary-action form-submit" disabled={categories.length === 0}><Plus aria-hidden="true" />{editingFoodId ? "保存修改" : "保存食物"}</button>
            </form>
          )}

          {view === "categories" && (
            <form className="manager-form" onSubmit={submitCategory}>
              <div className="editor-title">
                <h3>{editingCategoryId ? "编辑大类" : "新增大类"}</h3>
                {editingCategoryId && <button type="button" className="ghost-action" onClick={resetCategoryForm}>取消编辑</button>}
              </div>
              <label className="wide">大类名称<input value={categoryDraft.name} onChange={(event) => setCategoryDraft((current) => ({ ...current, name: event.target.value }))} placeholder="例如：粤菜小炒" /></label>
              <label>图标<select value={categoryDraft.icon} onChange={(event) => setCategoryDraft((current) => ({ ...current, icon: event.target.value }))}>{iconOptions.map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select></label>
              <label>颜色<input type="color" value={categoryDraft.color} onChange={(event) => setCategoryDraft((current) => ({ ...current, color: event.target.value }))} /></label>
              <label>顺序<input type="number" min="1" value={categoryDraft.sortOrder} onChange={(event) => setCategoryDraft((current) => ({ ...current, sortOrder: Number(event.target.value) }))} /></label>
              <label className="toggle-row"><input type="checkbox" checked={categoryDraft.enabled} onChange={(event) => setCategoryDraft((current) => ({ ...current, enabled: event.target.checked }))} />参与大类转盘</label>
              <button type="submit" className="primary-action form-submit"><Plus aria-hidden="true" />{editingCategoryId ? "保存大类" : "新增大类"}</button>
            </form>
          )}

          {view === "tags" && (
            <form className="manager-form tag-editor-form" onSubmit={submitTag}>
              <div className="editor-title">
                <h3>{editingTag ? "编辑标签" : "新增标签"}</h3>
                {editingTag && <button type="button" className="ghost-action" onClick={resetTagForm}>取消编辑</button>}
              </div>
              <label className="wide">标签名称<input value={tagDraft} onChange={(event) => setTagDraft(event.target.value)} placeholder="例如：清淡" /></label>
              <button type="submit" className="primary-action form-submit"><Plus aria-hidden="true" />{editingTag ? "保存标签" : "新增标签"}</button>
            </form>
          )}
        </div>

        <div className="management-list" aria-live="polite">
          {view === "foods" && (
            visibleFoods.length === 0 ? <p className="empty-result">没有符合条件的食物。</p> : visibleFoods.map((food) => {
              const category = categoryById.get(food.categoryId);
              const isFavorite = favorites.includes(food.id);
              return (
                <article key={food.id} className={`management-row ${food.enabled ? "" : "is-disabled"}`}>
                  <button type="button" className={`favorite-toggle ${isFavorite ? "is-active" : ""}`} onClick={() => onToggleFavorite(food.id)} aria-pressed={isFavorite} aria-label={`${isFavorite ? "取消收藏" : "加入收藏"} ${food.name}`}><Star aria-hidden="true" /></button>
                  <div className="row-main">
                    <strong>{food.name}</strong>
                    <span>{category?.name ?? "未分类"} / {food.tags.join("、") || "无标签"}</span>
                    {food.notes && <span>{food.notes}</span>}
                  </div>
                  <div className="row-metrics">
                    <RarityStars rarity={food.rarity} size="sm" />
                    <span className={`source-chip ${food.custom ? "is-custom" : ""}`}>{food.custom ? "自定义" : "内置"}</span>
                  </div>
                  <div className="row-actions">
                    <button type="button" className="icon-action" aria-label={`编辑 ${food.name}`} onClick={() => editFood(food)}><Edit3 aria-hidden="true" /></button>
                    <button type="button" className="icon-action" aria-label={`删除 ${food.name}`} onClick={() => onDeleteFood(food.id)}><Trash2 aria-hidden="true" /></button>
                  </div>
                </article>
              );
            })
          )}

          {view === "categories" && (
            visibleCategories.length === 0 ? <p className="empty-result">没有符合条件的大类。</p> : visibleCategories.map((category) => {
              const count = foods.filter((food) => food.categoryId === category.id).length;
              return (
                <article key={category.id} className={`management-row ${category.enabled ? "" : "is-disabled"}`}>
                  <span className="category-swatch" style={{ "--category-color": category.color } as CSSProperties}><CategoryIcon icon={category.icon} /></span>
                  <div className="row-main">
                    <strong>{category.name}</strong>
                    <span>顺序 {category.sortOrder} / {count} 个食物 / {category.enabled ? "参与转盘" : "已停用"}</span>
                  </div>
                  <div className="row-actions">
                    <button type="button" className="icon-action" aria-label={`编辑大类 ${category.name}`} onClick={() => editCategory(category)}><Edit3 aria-hidden="true" /></button>
                    <button type="button" className="icon-action" aria-label={`删除大类 ${category.name}`} onClick={() => onDeleteCategory(category.id)}><Trash2 aria-hidden="true" /></button>
                  </div>
                </article>
              );
            })
          )}

          {view === "tags" && (
            visibleTags.length === 0 ? <p className="empty-result">没有符合条件的标签。</p> : visibleTags.map((tag) => (
              <article key={tag} className="management-row tag-row">
                <div className="row-main">
                  <strong>{tag}</strong>
                  <span>{tagUsage.get(tag) ?? 0} 个食物使用</span>
                </div>
                <div className="row-actions">
                  <button type="button" className="icon-action" aria-label={`编辑标签 ${tag}`} onClick={() => editTag(tag)}><Edit3 aria-hidden="true" /></button>
                  <button type="button" className="icon-action" aria-label={`删除标签 ${tag}`} onClick={() => onDeleteTag(tag)}><Trash2 aria-hidden="true" /></button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
