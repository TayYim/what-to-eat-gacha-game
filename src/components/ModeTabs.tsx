import { CircleDotDashed, Database, Sparkles } from "lucide-react";

interface ModeTabsProps {
  mode: "wheel" | "gacha" | "data";
  onModeChange: (mode: "wheel" | "gacha" | "data") => void;
}

export function ModeTabs({ mode, onModeChange }: ModeTabsProps) {
  return (
    <div className="mode-tabs" aria-label="应用模式">
      <button
        className={mode === "wheel" ? "is-active" : ""}
        type="button"
        aria-pressed={mode === "wheel"}
        onClick={() => onModeChange("wheel")}
      >
        <CircleDotDashed aria-hidden="true" />
        转盘
      </button>
      <button
        className={mode === "gacha" ? "is-active" : ""}
        type="button"
        aria-pressed={mode === "gacha"}
        onClick={() => onModeChange("gacha")}
      >
        <Sparkles aria-hidden="true" />
        抽卡
      </button>
      <button
        className={mode === "data" ? "is-active" : ""}
        type="button"
        aria-pressed={mode === "data"}
        onClick={() => onModeChange("data")}
      >
        <Database aria-hidden="true" />
        数据管理
      </button>
    </div>
  );
}
