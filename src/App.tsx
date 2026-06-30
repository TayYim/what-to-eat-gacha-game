import { useEffect, useMemo, useRef, useState } from "react";
import { Database, ShieldCheck, Sparkles } from "lucide-react";
import { emptyFilterState, filterFoods, getAllTags } from "./domain/filters";
import { addHistoryEntry, loadStoredData, saveStoredData, upsertCustomFood } from "./domain/storage";
import { pickUniform, pickWeightedFood } from "./domain/random";
import type { DrawResult, FoodCategory, FoodFilterState, FoodItem, PickHistoryEntry } from "./domain/types";
import { DataManager } from "./components/DataManager";
import { FilterPanel } from "./components/FilterPanel";
import { GachaStage } from "./components/GachaStage";
import { HistoryRail } from "./components/HistoryRail";
import { ModeTabs } from "./components/ModeTabs";
import { WheelStage } from "./components/WheelStage";

const spinDuration = 1700;
const drawDuration = 980;

const createHistoryId = () => `pick-${Date.now()}-${Math.round(Math.random() * 100000)}`;
type AppMode = "wheel" | "gacha" | "data";

function App() {
  const stored = useMemo(() => loadStoredData(), []);
  const [mode, setMode] = useState<AppMode>("wheel");
  const [wheelMode, setWheelMode] = useState<"category" | "food">("category");
  const [categories, setCategories] = useState<FoodCategory[]>(stored.categories);
  const [foods, setFoods] = useState<FoodItem[]>(stored.foods);
  const [managedTags, setManagedTags] = useState<string[]>(stored.tags);
  const [history, setHistory] = useState<PickHistoryEntry[]>(stored.history);
  const [favorites, setFavorites] = useState<string[]>(stored.favorites);
  const [filters, setFilters] = useState<FoodFilterState>(emptyFilterState);
  const [spinning, setSpinning] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const spinTimerRef = useRef<number | undefined>(undefined);
  const drawTimerRef = useRef<number | undefined>(undefined);
  const [resultAnnouncement, setResultAnnouncement] = useState("等待命运启动");
  const [rotation, setRotation] = useState(0);
  const [selectedWheelEntry, setSelectedWheelEntry] = useState<{
    id: string;
    label: string;
    color: string;
    icon: string;
    rarity?: FoodItem["rarity"];
    meta: string;
  } | null>(null);
  const [lastDraws, setLastDraws] = useState<DrawResult[]>([]);

  const filteredFoods = useMemo(() => filterFoods(foods, filters), [foods, filters]);
  const tags = useMemo(() => {
    const merged = new Set([...managedTags, ...getAllTags(foods)]);
    return [...merged].sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  }, [foods, managedTags]);

  useEffect(() => {
    saveStoredData({ categories, foods, tags, history, favorites });
  }, [categories, favorites, foods, history, tags]);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current !== undefined) {
        window.clearTimeout(spinTimerRef.current);
      }
      if (drawTimerRef.current !== undefined) {
        window.clearTimeout(drawTimerRef.current);
      }
    };
  }, []);

  const addHistory = (entry: Omit<PickHistoryEntry, "id" | "createdAt">) => {
    setHistory((current) =>
      addHistoryEntry(current, {
        ...entry,
        id: createHistoryId(),
        createdAt: new Date().toISOString(),
      }),
    );
  };

  const spinWheel = () => {
    if (spinning) {
      return;
    }

    const categoryEntries = categories.filter((category) => category.enabled);
    const target =
      wheelMode === "category" ? pickUniform(categoryEntries) : pickWeightedFood(filteredFoods)?.item ?? null;

    if (!target) {
      return;
    }

    if (spinTimerRef.current !== undefined) {
      window.clearTimeout(spinTimerRef.current);
    }

    setSpinning(true);
    setResultAnnouncement("转盘正在转动");
    const poolLength = wheelMode === "category" ? categoryEntries.length : filteredFoods.length;
    const targetIndex =
      wheelMode === "category"
        ? categoryEntries.findIndex((category) => category.id === target.id)
        : filteredFoods.findIndex((food) => food.id === target.id);
    const sliceCenter = (360 / Math.max(poolLength, 1)) * targetIndex + 360 / Math.max(poolLength, 1) / 2;
    const nextRotation = rotation + 1440 + (360 - sliceCenter);
    setRotation(nextRotation);

    spinTimerRef.current = window.setTimeout(() => {
      if (wheelMode === "category") {
        const category = target as FoodCategory;
        setSelectedWheelEntry({
          id: category.id,
          label: category.name,
          color: category.color,
          icon: category.icon,
          meta: "大类候选",
        });
        addHistory({
          categoryId: category.id,
          label: category.name,
          mode: "category-wheel",
          poolSize: categoryEntries.length,
        });
        setResultAnnouncement(`转盘结果：${category.name}`);
      } else {
        const food = target as FoodItem;
        const category = categories.find((item) => item.id === food.categoryId);
        setSelectedWheelEntry({
          id: food.id,
          label: food.name,
          color: category?.color ?? "#00d9ff",
          icon: category?.icon ?? "fork",
          rarity: food.rarity,
          meta: category?.name ?? "未分类",
        });
        addHistory({
          foodId: food.id,
          label: food.name,
          mode: "food-wheel",
          poolSize: filteredFoods.length,
          rarity: food.rarity,
        });
        setResultAnnouncement(`转盘结果：${food.name}`);
      }
      setSpinning(false);
      spinTimerRef.current = undefined;
    }, spinDuration);
  };

  const runDraw = (count: 1 | 10) => {
    if (drawing || filteredFoods.length === 0) {
      return;
    }

    if (drawTimerRef.current !== undefined) {
      window.clearTimeout(drawTimerRef.current);
    }

    setDrawing(true);
    setResultAnnouncement("抽卡正在召唤");
    drawTimerRef.current = window.setTimeout(() => {
      const draws = Array.from({ length: count }, () => pickWeightedFood(filteredFoods)).filter(
        Boolean,
      ) as DrawResult[];

      if (count === 10 && draws.length === 10 && draws.every((draw) => draw.item.rarity < 4)) {
        const rarePool = filteredFoods.filter((food) => food.rarity >= 4);
        const guaranteed = pickWeightedFood(rarePool);
        if (guaranteed) {
          draws[9] = guaranteed;
        }
      }

      setLastDraws(draws);
      const first = draws[0];
      if (first) {
        const label = count === 10 ? `${first.item.name} 等 ${draws.length} 张` : first.item.name;
        addHistory({
          foodId: first.item.id,
          label,
          mode: "gacha",
          poolSize: filteredFoods.length,
          rarity: first.item.rarity,
        });
        setResultAnnouncement(`抽卡结果：${label}`);
      }
      setDrawing(false);
      drawTimerRef.current = undefined;
    }, drawDuration);
  };

  const upsertFood = (food: FoodItem) => {
    setFoods((current) => upsertCustomFood(current, food));
    setManagedTags((current) => [...new Set([...current, ...food.tags])]);
  };

  const deleteFood = (foodId: string) => {
    setFoods((current) => current.filter((food) => food.id !== foodId));
    setFavorites((current) => current.filter((id) => id !== foodId));
    setFilters((current) => ({
      ...current,
      excludedFoodIds: current.excludedFoodIds.filter((id) => id !== foodId),
    }));
  };

  const upsertCategory = (category: FoodCategory) => {
    setCategories((current) => {
      const existing = current.findIndex((item) => item.id === category.id);
      if (existing === -1) {
        return [...current, category].sort((a, b) => a.sortOrder - b.sortOrder);
      }

      return current.map((item) => (item.id === category.id ? category : item));
    });
  };

  const deleteCategory = (categoryId: string) => {
    const foodIdsInCategory = new Set(foods.filter((food) => food.categoryId === categoryId).map((food) => food.id));
    setCategories((current) => current.filter((category) => category.id !== categoryId));
    setFoods((current) => current.filter((food) => food.categoryId !== categoryId));
    setFavorites((current) => current.filter((id) => !foodIdsInCategory.has(id)));
    setFilters((current) => ({
      ...current,
      selectedCategoryIds: current.selectedCategoryIds.filter((id) => id !== categoryId),
      excludedFoodIds: current.excludedFoodIds.filter((id) => !foodIdsInCategory.has(id)),
    }));
  };

  const addTag = (tag: string) => {
    setManagedTags((current) => [...new Set([...current, tag])].sort((a, b) => a.localeCompare(b, "zh-Hans-CN")));
  };

  const renameTag = (oldTag: string, newTag: string) => {
    setManagedTags((current) =>
      [...new Set(current.map((tag) => (tag === oldTag ? newTag : tag)))].sort((a, b) =>
        a.localeCompare(b, "zh-Hans-CN"),
      ),
    );
    setFoods((current) =>
      current.map((food) => ({
        ...food,
        tags: [...new Set(food.tags.map((tag) => (tag === oldTag ? newTag : tag)))],
      })),
    );
    setFilters((current) => ({
      ...current,
      includedTags: [...new Set(current.includedTags.map((tag) => (tag === oldTag ? newTag : tag)))],
      excludedTags: [...new Set(current.excludedTags.map((tag) => (tag === oldTag ? newTag : tag)))],
    }));
  };

  const deleteTag = (tagName: string) => {
    setManagedTags((current) => current.filter((tag) => tag !== tagName));
    setFoods((current) =>
      current.map((food) => ({
        ...food,
        tags: food.tags.filter((tag) => tag !== tagName),
      })),
    );
    setFilters((current) => ({
      ...current,
      includedTags: current.includedTags.filter((tag) => tag !== tagName),
      excludedTags: current.excludedTags.filter((tag) => tag !== tagName),
    }));
  };

  const toggleFavorite = (foodId: string) => {
    setFavorites((current) =>
      current.includes(foodId) ? current.filter((id) => id !== foodId) : [foodId, ...current],
    );
  };

  return (
    <div className="app-shell">
      <div className="background-art" aria-hidden="true" />
      <header className="top-bar">
        <div className="brand-lockup">
          <span className="brand-mark">
            <Sparkles aria-hidden="true" />
          </span>
          <div>
            <h1>今天吃啥 Gacha</h1>
            <p>人生苦短，先吃饭吧</p>
          </div>
        </div>
        <ModeTabs mode={mode} onModeChange={setMode} />
        <div className="status-cluster" aria-label="数据状态">
          <span>
            <Database aria-hidden="true" />
            本地保存
          </span>
          <span>
            <ShieldCheck aria-hidden="true" />
            无需登录
          </span>
        </div>
      </header>

      <main className="app-grid">
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="result-status"
        >
          {resultAnnouncement}
        </div>
        <HistoryRail history={history} favoritesCount={favorites.length} />

        <div className="main-stack">
          {mode === "wheel" ? (
            <WheelStage
              wheelMode={wheelMode}
              categories={categories}
              foods={filteredFoods}
              spinning={spinning}
              rotation={rotation}
              selectedEntry={selectedWheelEntry}
              onWheelModeChange={setWheelMode}
              onSpin={spinWheel}
            />
          ) : mode === "gacha" ? (
            <GachaStage
              foods={filteredFoods}
              categories={categories}
              drawing={drawing}
              lastDraws={lastDraws}
              onDrawOne={() => runDraw(1)}
              onDrawTen={() => runDraw(10)}
            />
          ) : (
            <DataManager
              categories={categories}
              foods={foods}
              tags={tags}
              favorites={favorites}
              filteredCount={filteredFoods.length}
              onUpsertFood={upsertFood}
              onDeleteFood={deleteFood}
              onToggleFavorite={toggleFavorite}
              onUpsertCategory={upsertCategory}
              onDeleteCategory={deleteCategory}
              onAddTag={addTag}
              onRenameTag={renameTag}
              onDeleteTag={deleteTag}
            />
          )}

          {mode !== "data" && (
            <FilterPanel
              categories={categories}
              tags={tags}
              filters={filters}
              poolSize={filteredFoods.length}
              onFiltersChange={setFilters}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
