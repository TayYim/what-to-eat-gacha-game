import { Sparkles, Ticket, Zap } from "lucide-react";
import type { DrawResult, FoodCategory, FoodItem } from "../domain/types";
import { normalizeWeight } from "../domain/random";
import { CategoryIcon } from "./CategoryIcon";
import { RarityStars } from "./RarityStars";

interface GachaStageProps {
  foods: FoodItem[];
  categories: FoodCategory[];
  drawing: boolean;
  lastDraws: DrawResult[];
  onDrawOne: () => void;
  onDrawTen: () => void;
}

const rarityName = (rarity: FoodItem["rarity"]) => {
  if (rarity >= 5) return "SSR";
  if (rarity === 4) return "SR";
  if (rarity === 3) return "R";
  return "N";
};

export function GachaStage({
  foods,
  categories,
  drawing,
  lastDraws,
  onDrawOne,
  onDrawTen,
}: GachaStageProps) {
  const featured = [...foods].sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name, "zh-Hans-CN")).slice(0, 5);
  const visibleDraws = lastDraws.length > 0 ? lastDraws : featured.map((item) => ({
    item,
    randomValue: 0,
    totalWeight: foods.reduce((sum, food) => sum + normalizeWeight(food), 0),
    poolSize: foods.length,
  }));

  return (
    <section className="stage gacha-stage" aria-labelledby="gacha-title">
      <div className="stage-heading">
        <div>
          <p className="eyebrow">美食卡池</p>
          <h2 id="gacha-title">限定今日卡池</h2>
        </div>
        <div className="gacha-meta">
          <Ticket aria-hidden="true" />
          十连保底 4 星+
        </div>
      </div>

      <div className={`summon-zone ${drawing ? "is-drawing" : ""}`}>
        <div className="summon-ring" aria-hidden="true" />
        <div className="summon-light" aria-hidden="true" />
        <div className="card-grid" aria-live="polite">
          {visibleDraws.slice(0, 10).map((draw, index) => {
            const category = categories.find((item) => item.id === draw.item.categoryId);
            return (
              <article
                key={`${draw.item.id}-${index}`}
                className={`gacha-card rarity-${draw.item.rarity} ${
                  drawing ? "is-hidden" : "is-revealed"
                }`}
                style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}
              >
                <div className="card-rarity">{rarityName(draw.item.rarity)}</div>
                <div className="card-orbit" aria-hidden="true">
                  <CategoryIcon icon={category?.icon ?? "fork"} />
                </div>
                <h3>{draw.item.name}</h3>
                <p>{category?.name ?? "未分类"}</p>
                <RarityStars rarity={draw.item.rarity} />
              </article>
            );
          })}
        </div>
      </div>

      <div className="gacha-actions">
        <button
          type="button"
          className="secondary-action"
          onClick={onDrawOne}
          disabled={drawing || foods.length === 0}
        >
          <Zap aria-hidden="true" />
          单抽
        </button>
        <button
          type="button"
          className="primary-action"
          onClick={onDrawTen}
          disabled={drawing || foods.length === 0}
        >
          <Sparkles aria-hidden="true" />
          十连抽
        </button>
        <span className="result-hint">当前卡池 {foods.length} 个候选</span>
      </div>
    </section>
  );
}
