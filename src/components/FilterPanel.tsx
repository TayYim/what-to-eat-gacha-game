import { Ban, Check, RotateCcw } from "lucide-react";
import type { FoodCategory, FoodFilterState } from "../domain/types";
import { CategoryIcon } from "./CategoryIcon";

interface FilterPanelProps {
  categories: FoodCategory[];
  tags: string[];
  filters: FoodFilterState;
  poolSize: number;
  onFiltersChange: (filters: FoodFilterState) => void;
}

export function FilterPanel({
  categories,
  tags,
  filters,
  poolSize,
  onFiltersChange,
}: FilterPanelProps) {
  const toggleCategory = (categoryId: string) => {
    const exists = filters.selectedCategoryIds.includes(categoryId);
    onFiltersChange({
      ...filters,
      selectedCategoryIds: exists
        ? filters.selectedCategoryIds.filter((id) => id !== categoryId)
        : [...filters.selectedCategoryIds, categoryId],
    });
  };

  const cycleTag = (tag: string) => {
    if (filters.includedTags.includes(tag)) {
      onFiltersChange({
        ...filters,
        includedTags: filters.includedTags.filter((item) => item !== tag),
        excludedTags: [...filters.excludedTags, tag],
      });
      return;
    }

    if (filters.excludedTags.includes(tag)) {
      onFiltersChange({
        ...filters,
        excludedTags: filters.excludedTags.filter((item) => item !== tag),
      });
      return;
    }

    onFiltersChange({
      ...filters,
      includedTags: [...filters.includedTags, tag],
    });
  };

  return (
    <section className="control-panel filter-panel" aria-labelledby="filter-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">筛选池</p>
          <h2 id="filter-title">按类别和标签过滤</h2>
        </div>
        <span className="pool-pill">{poolSize} 个候选</span>
      </div>

      <div className="filter-group">
        <div className="filter-row-heading">大类</div>
        <div className="chip-grid">
          {categories.map((category) => {
            const active = filters.selectedCategoryIds.includes(category.id);
            return (
              <button
                key={category.id}
                className={`filter-chip ${active ? "is-active" : ""}`}
                style={{ "--chip-color": category.color } as React.CSSProperties}
                type="button"
                aria-pressed={active}
                onClick={() => toggleCategory(category.id)}
              >
                {active && <Check aria-hidden="true" />}
                <CategoryIcon icon={category.icon} />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-row-heading">标签</div>
        <div className="chip-grid">
          {tags.map((tag) => {
            const include = filters.includedTags.includes(tag);
            const exclude = filters.excludedTags.includes(tag);
            return (
              <button
                key={tag}
                className={`filter-chip ${include ? "is-active" : ""} ${
                  exclude ? "is-excluded" : ""
                }`}
                type="button"
                aria-pressed={include}
                aria-label={`标签 ${tag}：${include ? "已包含" : exclude ? "已排除" : "未使用"}`}
                onClick={() => cycleTag(tag)}
                title="点击循环：想吃、避开、关闭"
              >
                {include && <Check aria-hidden="true" />}
                {exclude && <Ban aria-hidden="true" />}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className="ghost-action"
        onClick={() =>
          onFiltersChange({
            selectedCategoryIds: [],
            includedTags: [],
            excludedTags: [],
            excludedFoodIds: [],
          })
        }
      >
        <RotateCcw aria-hidden="true" />
        重置筛选
      </button>
    </section>
  );
}
