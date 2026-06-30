import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CATEGORIES, FOODS, rarityWeight } from "./data/food-data";
import type { Category, Food, Rarity } from "./data/food-data";
import {
  activePool,
  bestDraw,
  categoryById,
  computeWheelRotation,
  createActiveMap,
  createDraws,
  createGlyphData,
  getWheelMarkerSize,
  pickWeighted,
  rarityTier,
  stars as starFlags,
} from "./domain/gacha";
import type { GlyphData } from "./domain/gacha";

type Mode = "gacha" | "wheel";
type WheelMode = "category" | "food";
type Phase = "idle" | "summoning" | "revealing";

interface AppProps {
  accent?: string;
  tenPullGuarantee?: boolean;
  particleDensity?: number;
}

interface Draw {
  item: Food;
}

interface WheelEntry {
  id: string;
  label: string;
  color: string;
  cat?: string;
  r?: Rarity;
  w?: number;
}

interface WheelResult {
  id: string;
  name: string;
  color: string;
  meta: string;
  isCat: boolean;
  r?: Rarity;
}

interface HistoryEntry {
  id: string;
  label: string;
  meta: string;
  code: string;
  color: string;
}

const HISTORY_KEY = "what-to-eat-gacha:destiny-history";
const DEFAULT_ACCENT = "#b89cff";
const ACCENT_OPTIONS = ["#b89cff", "#ffce6b", "#ff9ecf", "#7fe0d4"];
const glyphDataCache = new Map<string, GlyphData>();

const createHistoryId = () => `destiny-${Date.now()}-${Math.round(Math.random() * 100000)}`;

const clampParticleDensity = (value: number) => Math.max(0.3, Math.min(2, Math.round(value * 10) / 10));

const loadHistory = (): HistoryEntry[] => {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((entry): entry is HistoryEntry => {
        if (typeof entry !== "object" || entry === null) {
          return false;
        }
        const record = entry as Partial<HistoryEntry>;
        return (
          typeof record.id === "string" &&
          typeof record.label === "string" &&
          typeof record.meta === "string" &&
          typeof record.code === "string" &&
          typeof record.color === "string"
        );
      })
      .slice(0, 30);
  } catch {
    return [];
  }
};

const saveHistory = (history: HistoryEntry[]) => {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
  } catch {
    // Storage is non-critical; the picker must remain usable when it is blocked.
  }
};

const glyphData = (seed: string) => {
  const cached = glyphDataCache.get(seed);
  if (cached) {
    return cached;
  }

  const data = createGlyphData(seed);
  glyphDataCache.set(seed, data);
  return data;
};

const ConstellationGlyph = ({ seed, color, size = 56 }: { seed: string; color: string; size?: number }) => {
  const data = glyphData(seed);
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="constellation"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={data.path}
        stroke={color}
        strokeWidth="1.1"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.nodes.flatMap((node, index) => [
        <circle key={`h-${index}`} cx={node.x} cy={node.y} r={node.radius * 2.7} fill={color} opacity="0.14" />,
        <circle key={`c-${index}`} cx={node.x} cy={node.y} r={node.radius} fill="#ffffff" />,
        <circle key={`g-${index}`} cx={node.x} cy={node.y} r={node.radius * 0.5} fill={color} />,
      ])}
    </svg>
  );
};

const StarRating = ({ rarity, color, size = 12 }: { rarity: Rarity; color: string; size?: number }) => (
  <span className="stars" aria-label={`${rarity} 星`}>
    {starFlags(rarity).map((filled, index) => (
      <span
        key={index}
        style={
          {
            "--star-color": filled ? color : "rgba(255,255,255,.16)",
            "--star-size": `${size}px`,
            "--star-shadow": filled ? `0 0 7px ${color}` : "none",
          } as CSSProperties
        }
      >
        ★
      </span>
    ))}
  </span>
);

const Starfield = ({ particleDensity }: { particleDensity: number }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return undefined;
    }

    let width = 0;
    let height = 0;
    let frame = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const count = Math.max(40, Math.round(((width * height) / 8500) * particleDensity));
    const palette = ["#ffffff", "#ffe9b8", "#cdd6ff", "#e7c8ff"];
    const stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.4,
      tw: Math.random() * Math.PI * 2,
      sp: Math.random() * 0.012 + 0.004,
      drift: Math.random() * 0.1 + 0.02,
      c: palette[(Math.random() * palette.length) | 0],
    }));
    const dust = Array.from({ length: Math.round(count * 0.16) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1 + 0.5,
      v: Math.random() * 0.22 + 0.06,
    }));

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      for (const star of stars) {
        const alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 0.001 * 60 * star.sp + star.tw));
        if (!reduced) {
          star.y += star.drift;
          if (star.y > height) {
            star.y = 0;
          }
        }
        context.globalAlpha = alpha;
        context.fillStyle = star.c;
        context.beginPath();
        context.arc(star.x, star.y, star.r, 0, 6.283);
        context.fill();
      }

      context.fillStyle = "#ffcf6b";
      for (const mote of dust) {
        if (!reduced) {
          mote.y -= mote.v;
          if (mote.y < 0) {
            mote.y = height;
            mote.x = Math.random() * width;
          }
        }
        context.globalAlpha = 0.5;
        context.beginPath();
        context.arc(mote.x, mote.y, mote.r, 0, 6.283);
        context.fill();
      }
      context.globalAlpha = 1;
      if (!reduced) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    frame = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frame);
    };
  }, [particleDensity]);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
};

const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
};

function App({
  accent: initialAccent = DEFAULT_ACCENT,
  tenPullGuarantee: initialTenPullGuarantee = true,
  particleDensity: initialParticleDensity = 1,
}: AppProps) {
  const [accent, setAccent] = useState(initialAccent);
  const [tenPullGuarantee, setTenPullGuarantee] = useState(initialTenPullGuarantee);
  const [particleDensity, setParticleDensity] = useState(() => clampParticleDensity(initialParticleDensity));
  const [mode, setMode] = useState<Mode>("gacha");
  const [wheelMode, setWheelMode] = useState<WheelMode>("category");
  const [active, setActive] = useState(() => createActiveMap(CATEGORIES));
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<WheelResult | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [draws, setDraws] = useState<Draw[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [auraRarity, setAuraRarity] = useState<Rarity>(3);
  const [flash, setFlash] = useState<string | null>(null);
  const [lastDraws, setLastDraws] = useState<Draw[] | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const summonTimersRef = useRef<number[]>([]);
  const wheelTimerRef = useRef<number | null>(null);
  const committedRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const summonDelay = reducedMotion ? 1 : 1700;
  const revealDelay = (rarity: Rarity) => (reducedMotion ? 1 : rarity >= 5 ? 760 : rarity >= 4 ? 560 : 300);
  const flashDelay = reducedMotion ? 1 : 700;
  const wheelDelay = reducedMotion ? 1 : 1750;

  const categoryMap = useMemo(() => new Map(CATEGORIES.map((category) => [category.id, category])), []);
  const pool = useMemo(() => activePool(FOODS, active), [active]);
  const wheelEntries = useMemo<WheelEntry[]>(() => {
    if (wheelMode === "category") {
      return CATEGORIES.filter((category) => active[category.id] !== false).map((category) => ({
        id: category.id,
        label: category.name,
        color: category.color,
      }));
    }

    return pool.map((food) => {
      const category = categoryById(CATEGORIES, food.cat);
      return {
        id: food.id,
        label: food.name,
        color: category?.color ?? "#9bb",
        cat: food.cat,
        r: food.r,
        w: rarityWeight(food.r),
      };
    });
  }, [active, pool, wheelMode]);

  const wheelMarker = getWheelMarkerSize(wheelEntries.length);
  const wheelGradient = wheelEntries.length
    ? `conic-gradient(from -90deg, ${wheelEntries
        .map((entry, index) => {
          const slice = 100 / wheelEntries.length;
          return `${entry.color} ${index * slice}% ${(index + 1) * slice}%`;
        })
        .join(", ")})`
    : "conic-gradient(#241a52, #0c0826)";
  const bestLastDraw = lastDraws ? bestDraw(lastDraws) : null;
  const lastTier = bestLastDraw ? rarityTier(bestLastDraw.item.r) : null;
  const overlayOpen = phase !== "idle";
  const revealDone = draws.length > 0 && revealedCount >= draws.length;
  const auraTier = rarityTier(auraRarity);

  const clearSummonTimers = () => {
    for (const timer of summonTimersRef.current) {
      window.clearTimeout(timer);
    }
    summonTimersRef.current = [];
  };

  const addSummonTimer = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    summonTimersRef.current.push(timer);
    return timer;
  };

  const clearWheelTimer = () => {
    if (wheelTimerRef.current !== null) {
      window.clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = null;
    }
  };

  const addHistory = (entry: Omit<HistoryEntry, "id">) => {
    setHistory((current) => [{ id: createHistoryId(), ...entry }, ...current].slice(0, 30));
  };

  const commitHistory = (nextDraws: Draw[]) => {
    if (committedRef.current || nextDraws.length === 0) {
      return;
    }

    const best = bestDraw(nextDraws);
    if (!best) {
      return;
    }

    const tier = rarityTier(best.item.r);
    committedRef.current = true;
    setLastDraws(nextDraws);
    addHistory({
      label: nextDraws.length > 1 ? `${best.item.name} 等 ${nextDraws.length} 项` : best.item.name,
      meta: nextDraws.length > 1 ? "十连召唤" : "单抽召唤",
      code: tier.code,
      color: tier.color,
    });
  };

  const scheduleReveal = (nextDraws: Draw[]) => {
    let index = 0;
    const tick = () => {
      if (index >= nextDraws.length) {
        commitHistory(nextDraws);
        return;
      }

      index += 1;
      const card = nextDraws[index - 1];
      setRevealedCount(index);
      if (card.item.r >= 5) {
        setFlash("rgba(255,206,107,.9)");
        addSummonTimer(() => setFlash(null), flashDelay);
      }
      addSummonTimer(tick, revealDelay(card.item.r));
    };

    tick();
  };

  const doDraw = (count: 1 | 10, force = false) => {
    if ((!force && phase !== "idle") || pool.length === 0) {
      return;
    }

    clearSummonTimers();
    committedRef.current = false;
    const nextDraws = createDraws({ count, pool, tenPullGuarantee });
    if (nextDraws.length === 0) {
      return;
    }

    setDraws(nextDraws);
    setRevealedCount(0);
    setAuraRarity(Math.max(...nextDraws.map((draw) => draw.item.r)) as Rarity);
    setFlash(null);
    setShowHistory(false);
    setPhase("summoning");
    addSummonTimer(() => {
      setPhase("revealing");
      scheduleReveal(nextDraws);
    }, summonDelay);
  };

  const skipReveal = () => {
    if (phase !== "revealing" || revealDone) {
      return;
    }
    clearSummonTimers();
    setRevealedCount(draws.length);
    if (draws.some((draw) => draw.item.r >= 5)) {
      setFlash("rgba(255,206,107,.9)");
      addSummonTimer(() => setFlash(null), flashDelay);
    }
    commitHistory(draws);
  };

  const closeOverlay = () => {
    if (revealDone) {
      commitHistory(draws);
    }
    clearSummonTimers();
    committedRef.current = false;
    setPhase("idle");
    setDraws([]);
    setRevealedCount(0);
    setFlash(null);
  };

  const againTen = () => {
    if (revealDone) {
      commitHistory(draws);
    }
    doDraw(10, true);
  };

  const spin = () => {
    if (spinning || wheelEntries.length === 0) {
      return;
    }

    clearWheelTimer();

    let targetIndex = 0;
    if (wheelMode === "category") {
      targetIndex = Math.floor(Math.random() * wheelEntries.length);
    } else {
      const picked = pickWeighted(pool);
      targetIndex = Math.max(
        0,
        wheelEntries.findIndex((entry) => entry.id === picked?.id),
      );
    }

    const nextRotation = computeWheelRotation({
      currentRotation: rotation,
      entryCount: wheelEntries.length,
      targetIndex,
    });
    setRotation(nextRotation);
    setSpinning(true);
    setWheelResult(null);

    wheelTimerRef.current = window.setTimeout(() => {
      const entry = wheelEntries[targetIndex];
      if (!entry) {
        setSpinning(false);
        wheelTimerRef.current = null;
        return;
      }

      const tier = entry.r ? rarityTier(entry.r) : null;
      const category = entry.cat ? categoryById(CATEGORIES, entry.cat) : null;
      const result: WheelResult =
        wheelMode === "category"
          ? {
              id: entry.id,
              name: entry.label,
              color: entry.color,
              meta: "今日大方向",
              isCat: true,
            }
          : {
              id: entry.id,
              name: entry.label,
              color: entry.color,
              meta: `${category?.name ?? "未分类"} · ${tier?.label ?? "普通"} · 权重 ${entry.w ?? 0}`,
              isCat: false,
              r: entry.r,
            };

      setWheelResult(result);
      setSpinning(false);
      wheelTimerRef.current = null;
      addHistory({
        label: result.name,
        meta: result.isCat ? "大类转盘" : `食物转盘 · ${category?.name ?? "未分类"}`,
        code: result.isCat ? "WHEEL" : tier?.code ?? "R",
        color: result.isCat ? result.color : tier?.color ?? result.color,
      });
    }, wheelDelay);
  };

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    return () => {
      clearSummonTimers();
      clearWheelTimer();
    };
  }, []);

  const appStyle = {
    "--accent": accent,
    "--accent-glow": `color-mix(in srgb, ${accent} 60%, transparent)`,
  } as CSSProperties;

  const resultTier = wheelResult && !wheelResult.isCat && wheelResult.r ? rarityTier(wheelResult.r) : null;
  const resultColor = resultTier?.color ?? wheelResult?.color ?? accent;
  const resultGlow = resultTier?.glow ?? (wheelResult ? `color-mix(in srgb, ${wheelResult.color} 55%, transparent)` : "transparent");

  return (
    <div className="destiny-app" style={appStyle}>
      <div className="bg-layer bg-layer-primary" aria-hidden="true" />
      <div className="bg-layer bg-layer-glow" aria-hidden="true" />
      <Starfield particleDensity={particleDensity} />

      <div className="app-column">
        <header className="destiny-header">
          <div className="brand">
            <div className="brand-mark">
              <span>食</span>
            </div>
            <div className="brand-copy">
              <h1>
                今天吃啥 <span>·</span> 召唤
              </h1>
              <p>DESTINY&nbsp;GACHA</p>
            </div>
          </div>
          <button className="history-button" aria-label="历史记录" onClick={() => setShowHistory(true)}>
            <span>史</span>
          </button>
        </header>

        <nav className="mode-tabs" aria-label="模式">
          <button
            className={mode === "gacha" ? "active" : ""}
            aria-pressed={mode === "gacha"}
            disabled={spinning}
            onClick={() => setMode("gacha")}
          >
            <span>卡池抽卡</span>
            <small>SUMMON</small>
          </button>
          <button
            className={mode === "wheel" ? "active" : ""}
            aria-pressed={mode === "wheel"}
            disabled={spinning}
            onClick={() => setMode("wheel")}
          >
            <span>命运转盘</span>
            <small>WHEEL</small>
          </button>
        </nav>

        <div className="category-strip" aria-label="大类筛选">
          {CATEGORIES.map((category) => {
            const on = active[category.id] !== false;
            return (
              <button
                key={category.id}
                data-testid="category-chip"
                className={on ? "category-chip active" : "category-chip"}
                aria-pressed={on}
                style={{ "--category-color": category.color } as CSSProperties}
                disabled={spinning}
                onClick={() => setActive((current) => ({ ...current, [category.id]: current[category.id] === false }))}
              >
                <span className="chip-glyph">
                  <ConstellationGlyph seed={`cat-${category.id}`} color={category.color} size={16} />
                </span>
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        <main className="main-stage">
          {mode === "gacha" ? (
            <section className="gacha-stage" aria-label="卡池抽卡">
              <div className="banner-card">
                <div className="banner-glyph">
                  <ConstellationGlyph seed="banner-destiny" color={accent} size={150} />
                </div>
                <div className="banner-copy">
                  <p>LIMITED&nbsp;BANNER</p>
                  <h2>限定 · 今日卡池</h2>
                  <span>
                    十连必出 <b>4★ 稀有</b> 及以上 · 抽取权重由稀有度决定
                  </span>
                </div>
              </div>

              <div className="weights-card">
                <div className="weights-head">
                  <span>RARITY&nbsp;WEIGHTS · 稀有度权重</span>
                  <small>十连保底 4★+</small>
                </div>
                <div className="weight-grid">
                  {[
                    { code: "R · 优良", value: 94, color: "#6cc6ff", mix: 12 },
                    { code: "SR · 稀有", value: 5, color: "#c08cff", mix: 12 },
                    { code: "SSR · 传说", value: 1, color: "#ffce6b", mix: 14 },
                  ].map((weight) => (
                    <div
                      key={weight.code}
                      className="weight-cell"
                      style={{ "--tier-color": weight.color, "--tier-mix": `${weight.mix}%` } as CSSProperties}
                    >
                      <span>{weight.code}</span>
                      <strong>{weight.value}</strong>
                      <small>权重</small>
                    </div>
                  ))}
                </div>
              </div>

              {bestLastDraw && lastTier ? (
                <div
                  className="last-card"
                  style={{ "--tier-color": lastTier.color, "--tier-glow": lastTier.glow } as CSSProperties}
                >
                  <div className="last-glyph">
                    <ConstellationGlyph seed={`food-${bestLastDraw.item.id}`} color={lastTier.color} size={40} />
                  </div>
                  <div className="last-copy">
                    <p>上次召唤 · {lastTier.code}</p>
                    <strong>{bestLastDraw.item.name}</strong>
                    <StarRating rarity={bestLastDraw.item.r} color={lastTier.color} size={12} />
                  </div>
                </div>
              ) : null}
            </section>
          ) : (
            <section className="wheel-stage" aria-label="命运转盘">
              <div className="wheel-switch">
                <button
                  className={wheelMode === "category" ? "active" : ""}
                  aria-pressed={wheelMode === "category"}
                  disabled={spinning}
                  onClick={() => {
                    setWheelMode("category");
                    setWheelResult(null);
                  }}
                >
                  大类转盘
                </button>
                <button
                  className={wheelMode === "food" ? "active" : ""}
                  aria-pressed={wheelMode === "food"}
                  disabled={spinning}
                  onClick={() => {
                    setWheelMode("food");
                    setWheelResult(null);
                  }}
                >
                  食物转盘
                </button>
              </div>

              <div className="wheel-shell">
                <div className="wheel-halo" />
                <div className="wheel-rim" />
                <div className="wheel-dash" />
                <div className="wheel-pointer" />
                <div
                  className="wheel-disc"
                  style={
                    {
                      "--wheel-gradient": wheelGradient,
                      "--wheel-rotation": `${rotation}deg`,
                      "--wheel-transition": spinning ? "transform 1750ms cubic-bezier(.12,.74,.06,1)" : "transform .4s ease",
                    } as CSSProperties
                  }
                >
                  {wheelEntries.map((entry, index) => {
                    const angle = (360 / Math.max(wheelEntries.length, 1)) * index + 360 / Math.max(wheelEntries.length, 1) / 2;
                    const selected = wheelResult?.id === entry.id && !spinning;
                    return (
                      <div
                        key={entry.id}
                        data-testid="wheel-marker"
                        className="wheel-marker"
                        aria-label={`${entry.label}，候选`}
                        style={
                          {
                            "--marker-size": `${wheelMarker.markerSize}px`,
                            "--marker-radius": `${wheelMarker.radius}px`,
                            "--marker-angle": `${angle}deg`,
                            "--marker-counter-angle": `${-angle}deg`,
                            "--marker-color": entry.color,
                            "--marker-selected": selected ? "0 0 0 3px #fff, 0 0 18px var(--marker-color)" : "0 0 0 0 transparent",
                          } as CSSProperties
                        }
                      >
                        <span>
                          <ConstellationGlyph
                            seed={`${entry.r ? "food" : "cat"}-${entry.id}`}
                            color="#1a0f2e"
                            size={wheelMarker.iconSize}
                          />
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="wheel-hub">
                  <span>命</span>
                </div>
              </div>

              <div className="result-card">
                <p>RESULT</p>
                {wheelResult ? (
                  <div className="result-filled">
                    <div className="result-glyph" style={{ "--result-color": resultColor, "--result-glow": resultGlow } as CSSProperties}>
                      <ConstellationGlyph
                        seed={`${wheelResult.isCat ? "cat" : "food"}-${wheelResult.id}`}
                        color={resultColor}
                        size={30}
                      />
                    </div>
                    <div className="result-copy">
                      <strong>{wheelResult.name}</strong>
                      <span>{wheelResult.meta}</span>
                      {wheelResult.r ? (
                        <StarRating rarity={wheelResult.r} color={resultColor} size={13} />
                      ) : (
                        <small>先决定大方向</small>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="empty-result">别纠结了 —— 命运已就位，转动它。</span>
                )}
              </div>

              <button className="spin-button" disabled={spinning || wheelEntries.length === 0} onClick={spin}>
                {spinning ? "命运转动中…" : wheelMode === "category" ? "转动命运转盘" : "抽取当前食物池"}
              </button>
              <p className="pool-count">已从 {wheelEntries.length} 个候选中抉择</p>
            </section>
          )}
        </main>

      </div>

      {mode === "gacha" ? (
        <div className="action-bar">
          <div>
            <button className="draw-one" disabled={pool.length === 0 || overlayOpen} onClick={() => doDraw(1)}>
              <span>单抽</span>
              <small>×1</small>
            </button>
            <button className="draw-ten" disabled={pool.length === 0 || overlayOpen} onClick={() => doDraw(10)}>
              <span>十连召唤</span>
              <small>SUMMON ×10</small>
            </button>
          </div>
        </div>
      ) : null}

      {overlayOpen ? (
        <div className="summon-overlay" aria-modal="true" role="dialog">
          {phase === "summoning" ? (
            <div className="summoning-phase" style={{ "--aura-color": auraTier.color, "--aura-glow": auraTier.glow } as CSSProperties}>
              <div className="aura-ring" />
              <div className="aura-dash" />
              <div className="aura-beam" />
              <div className="summoning-copy">
                <ConstellationGlyph seed="banner-destiny" color={auraTier.color} size={96} />
                <p>SUMMONING</p>
                <span>命运正在汇聚…</span>
              </div>
            </div>
          ) : (
            <div className="reveal-phase">
              <div className="reveal-head">
                <p>{draws.length > 1 ? `十连召唤结果 · ${revealedCount}/${draws.length}` : "召唤结果"}</p>
                <button className="skip-button" disabled={revealDone} onClick={skipReveal}>
                  {revealDone ? "已全部揭晓" : "跳过 ⏩"}
                </button>
              </div>

              <div className={draws.length <= 1 ? "card-grid single" : "card-grid"}>
                {draws.map((draw, index) => {
                  const tier = rarityTier(draw.item.r);
                  const category = categoryMap.get(draw.item.cat);
                  const faceUp = index < revealedCount;
                  return (
                    <div
                      key={`${draw.item.id}-${index}`}
                      className="draw-card"
                      style={{ "--tier-color": tier.color, "--tier-glow": tier.glow } as CSSProperties}
                    >
                      {faceUp ? (
                        <div className="card-front">
                          <span className="tier-code">{tier.code}</span>
                          <span className="shine" />
                          <div className="card-glyph">
                            <ConstellationGlyph seed={`food-${draw.item.id}`} color={tier.color} size={draws.length <= 1 ? 72 : 40} />
                          </div>
                          <strong>{draw.item.name}</strong>
                          <small>{category?.name ?? "未分类"}</small>
                          <StarRating rarity={draw.item.r} color={tier.color} size={draws.length <= 1 ? 15 : 9} />
                        </div>
                      ) : (
                        <div className="card-back">
                          <span>食</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {revealDone ? (
                <div className="reveal-actions">
                  <button onClick={closeOverlay}>完成</button>
                  <button onClick={againTen}>再抽十连</button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {flash ? <div className="screen-flash" style={{ "--flash-color": flash } as CSSProperties} /> : null}

      {showHistory ? (
        <>
          <button className="history-scrim" aria-label="关闭历史记录" onClick={() => setShowHistory(false)} />
          <aside className="history-drawer" aria-label="命运记录">
            <div className="drawer-handle" />
            <div className="drawer-head">
              <h2>命运记录</h2>
              <span>最近 {history.length} 次</span>
            </div>
            <div className="drawer-settings" aria-label="设置">
              <div className="accent-options" aria-label="主题色">
                {ACCENT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    aria-label={`主题色 ${option}`}
                    className={accent === option ? "active" : ""}
                    style={{ "--swatch": option } as CSSProperties}
                    onClick={() => setAccent(option)}
                  />
                ))}
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={tenPullGuarantee}
                  onChange={(event) => setTenPullGuarantee(event.target.checked)}
                />
                <span>十连保底 4★+</span>
              </label>
              <label>
                <span>星尘</span>
                <input
                  type="range"
                  min="0.3"
                  max="2"
                  step="0.1"
                  value={particleDensity}
                  onChange={(event) => setParticleDensity(clampParticleDensity(Number(event.target.value)))}
                />
              </label>
            </div>
            {history.length ? (
              <div className="history-list">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    data-testid="history-row"
                    className="history-row"
                    style={{ "--history-color": entry.color } as CSSProperties}
                  >
                    <span className="history-bar" />
                    <div>
                      <strong>{entry.label}</strong>
                      <small>{entry.meta}</small>
                    </div>
                    <em>{entry.code}</em>
                  </div>
                ))}
              </div>
            ) : (
              <p className="history-empty">尚无记录 —— 去召唤你的第一餐吧。</p>
            )}
          </aside>
        </>
      ) : null}
    </div>
  );
}

export default App;
