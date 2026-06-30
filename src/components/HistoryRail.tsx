import { Clock3, Heart } from "lucide-react";
import type { PickHistoryEntry } from "../domain/types";
import { RarityStars } from "./RarityStars";

interface HistoryRailProps {
  history: PickHistoryEntry[];
  favoritesCount: number;
}

export function HistoryRail({ history, favoritesCount }: HistoryRailProps) {
  return (
    <aside className="history-rail" aria-labelledby="history-title">
      <div className="rail-stat">
        <Heart aria-hidden="true" />
        <span>收藏</span>
        <strong>{favoritesCount}</strong>
      </div>
      <div className="rail-heading">
        <Clock3 aria-hidden="true" />
        <h2 id="history-title">抽取记录</h2>
      </div>
      {history.length === 0 ? (
        <p className="empty-result">还没有结果</p>
      ) : (
        <ol className="history-list">
          {history.map((entry) => (
            <li key={entry.id}>
              <strong title={entry.label}>{entry.label}</strong>
              <span>
                {entry.mode === "gacha" ? "抽卡" : entry.mode === "food-wheel" ? "食物转盘" : "大类转盘"}
                {" / "}
                {entry.poolSize} 个候选
              </span>
              {entry.rarity && <RarityStars rarity={entry.rarity} size="sm" />}
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
