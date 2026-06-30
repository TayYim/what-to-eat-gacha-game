import { useEffect, useMemo, useState } from "react";
import { CircleDotDashed, RotateCw, Trophy } from "lucide-react";
import type { FoodCategory, FoodItem } from "../domain/types";
import { CategoryIcon } from "./CategoryIcon";
import { RarityStars } from "./RarityStars";

interface WheelEntry {
  id: string;
  label: string;
  color: string;
  icon: string;
  rarity?: FoodItem["rarity"];
  meta: string;
}

interface WheelStageProps {
  wheelMode: "category" | "food";
  categories: FoodCategory[];
  foods: FoodItem[];
  spinning: boolean;
  rotation: number;
  selectedEntry: WheelEntry | null;
  onWheelModeChange: (mode: "category" | "food") => void;
  onSpin: () => void;
}

const getWheelMarkerSize = (entryCount: number) => {
  if (entryCount <= 0) {
    return 32;
  }

  return Math.max(16, Math.min(50, Math.floor(520 / entryCount)));
};

const getWheelPointerSize = (markerSize: number) => ({
  halfWidth: Math.max(10, Math.min(18, Math.round(markerSize * 0.6))),
  height: Math.max(28, Math.min(46, Math.round(markerSize))),
});

export function WheelStage({
  wheelMode,
  categories,
  foods,
  spinning,
  rotation,
  selectedEntry,
  onWheelModeChange,
  onSpin,
}: WheelStageProps) {
  const [previewEntry, setPreviewEntry] = useState<{ id: string; source: "hover" | "click" } | null>(null);

  const entries = useMemo<WheelEntry[]>(() => {
    if (wheelMode === "category") {
      return categories.map((category) => ({
        id: category.id,
        label: category.name,
        color: category.color,
        icon: category.icon,
        meta: "大类候选",
      }));
    }

    return foods.map((food) => {
      const category = categories.find((item) => item.id === food.categoryId);
      return {
        id: food.id,
        label: food.name,
        color: category?.color ?? "#00d9ff",
        icon: category?.icon ?? "fork",
        rarity: food.rarity,
        meta: category?.name ?? "未分类",
      };
    });
  }, [categories, foods, wheelMode]);

  const gradient = useMemo(() => {
    if (entries.length === 0) {
      return "conic-gradient(from 0deg, #243044, #111827)";
    }

    const slice = 100 / entries.length;
    return `conic-gradient(from 0deg, ${entries
      .map((entry, index) => {
        const start = index * slice;
        const end = (index + 1) * slice;
        return `${entry.color} ${start}% ${end}%`;
      })
      .join(", ")})`;
  }, [entries]);

  useEffect(() => {
    setPreviewEntry(null);
  }, [selectedEntry?.id, wheelMode]);

  useEffect(() => {
    if (previewEntry && !entries.some((entry) => entry.id === previewEntry.id)) {
      setPreviewEntry(null);
    }
  }, [entries, previewEntry]);

  const previewEntryItem = previewEntry ? entries.find((entry) => entry.id === previewEntry.id) ?? null : null;
  const selectedEntryInCurrentWheel =
    selectedEntry && entries.some((entry) => entry.id === selectedEntry.id) ? selectedEntry : null;
  const displayEntry = spinning ? null : previewEntryItem ?? selectedEntryInCurrentWheel;
  const previewLabel = previewEntry
    ? previewEntry.source === "click"
      ? "点选的候选"
      : "指向的候选"
    : "上次结果";
  const markerSize = getWheelMarkerSize(entries.length);
  const pointerSize = getWheelPointerSize(markerSize);
  const sliceAngle = entries.length > 0 ? 360 / entries.length : 360;

  return (
    <section className="stage wheel-stage" aria-labelledby="wheel-title">
      <div className="stage-heading">
        <div>
          <p className="eyebrow">命运转盘</p>
          <h2 id="wheel-title">{wheelMode === "category" ? "先决定大方向" : "从当前食物池抽取"}</h2>
        </div>
        <div className="segmented-control" aria-label="转盘类型">
          <button
            type="button"
            className={wheelMode === "category" ? "is-active" : ""}
            aria-pressed={wheelMode === "category"}
            aria-label={`大类转盘${wheelMode === "category" ? "，当前选中" : ""}`}
            onClick={() => onWheelModeChange("category")}
          >
            大类
          </button>
          <button
            type="button"
            className={wheelMode === "food" ? "is-active" : ""}
            aria-pressed={wheelMode === "food"}
            aria-label={`食物转盘${wheelMode === "food" ? "，当前选中" : ""}`}
            onClick={() => onWheelModeChange("food")}
          >
            食物
          </button>
        </div>
      </div>

      <div className="wheel-layout">
        <div
          className={`wheel-shell ${spinning ? "is-spinning" : ""}`}
          style={
            {
              "--pointer-half-width": `${pointerSize.halfWidth}px`,
              "--pointer-height": `${pointerSize.height}px`,
            } as React.CSSProperties
          }
        >
          <div className="wheel-pointer" aria-hidden="true" />
          <div
            className="wheel-disc"
            style={{
              "--wheel-gradient": gradient,
              "--wheel-rotation": `${rotation}deg`,
              "--marker-size": `${markerSize}px`,
              "--slice-angle": `${sliceAngle}deg`,
              transform: `rotate(${rotation}deg)`,
            } as React.CSSProperties}
            role="group"
            aria-label="转盘候选图标"
          >
            {entries.map((entry, index) => {
              const angle = (360 / entries.length) * index + 360 / entries.length / 2;
              return (
                <button
                  key={entry.id}
                  type="button"
                  className={`wheel-marker ${displayEntry?.id === entry.id ? "is-selected" : ""}`}
                  data-testid="wheel-marker"
                  aria-label={`${entry.label}，${entry.meta}`}
                  title={entry.label}
                  onMouseEnter={() => setPreviewEntry({ id: entry.id, source: "hover" })}
                  onFocus={() => setPreviewEntry({ id: entry.id, source: "hover" })}
                  onMouseLeave={() => setPreviewEntry((current) => (current?.source === "hover" ? null : current))}
                  onBlur={() => setPreviewEntry((current) => (current?.source === "hover" ? null : current))}
                  onClick={() => setPreviewEntry({ id: entry.id, source: "click" })}
                  disabled={spinning}
                  style={
                    {
                      "--entry-color": entry.color,
                      transform: `rotate(${angle}deg) translateY(calc(-1 * var(--marker-radius))) rotate(${-angle}deg)`,
                    } as React.CSSProperties
                  }
                >
                  <span className="wheel-marker-icon" aria-hidden="true">
                    <CategoryIcon icon={entry.icon} />
                  </span>
                </button>
              );
            })}
          </div>
          <div className="wheel-core" aria-hidden="true">
            <CircleDotDashed />
          </div>
        </div>

        <div className="result-console">
          <p className="console-label">候选信息</p>
          {spinning || displayEntry ? (
            <div className="wheel-preview" aria-live="polite">
              <span className="wheel-preview-label">{spinning ? "转盘正在转动" : previewLabel}</span>
              <strong data-testid="wheel-selected-name">
                {spinning ? "转动中" : displayEntry?.label}
              </strong>
              <span className="wheel-preview-meta">
                {spinning ? "正在重新结算" : displayEntry?.meta}
              </span>
            </div>
          ) : (
            <p className="wheel-tip">点击转盘图标查看对应候选</p>
          )}
          {selectedEntry ? (
            <div className="winner-card">
              <span className="winner-icon">
                <Trophy aria-hidden="true" />
              </span>
              <div className="winner-copy">
                <strong className="winner-title">{selectedEntry.label}</strong>
                <span className="winner-meta">{selectedEntry.meta}</span>
                {selectedEntry.rarity && <RarityStars rarity={selectedEntry.rarity} size="sm" />}
              </div>
            </div>
          ) : (
            <div className="empty-result">别纠结了，命运已待命</div>
          )}

          <button
            type="button"
            className="primary-action wheel-action"
            onClick={onSpin}
            disabled={spinning || entries.length === 0}
          >
            <RotateCw aria-hidden="true" />
            {spinning ? "转动中" : wheelMode === "category" ? "开始转动" : "抽当前食物池"}
          </button>
          <p className="result-hint">已从 {entries.length} 个候选中选择</p>
        </div>
      </div>
    </section>
  );
}
