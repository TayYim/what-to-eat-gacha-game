import { describe, expect, it } from "vitest";
import type { Category, Food } from "../data/food-data";
import {
  computeWheelRotation,
  createDraws,
  createGlyphData,
  getWheelMarkerSize,
  hashStr,
  prng,
  rarityTier,
} from "./gacha";

const categories: Category[] = [
  { id: "a", name: "一", color: "#111111" },
  { id: "b", name: "二", color: "#222222" },
];

const foods: Food[] = [
  { id: "r-one", name: "优良一", cat: "a", r: 3 },
  { id: "r-two", name: "优良二", cat: "a", r: 3 },
  { id: "sr-one", name: "稀有一", cat: "b", r: 4 },
  { id: "ssr-one", name: "传说一", cat: "b", r: 5 },
];

describe("gacha helpers", () => {
  it("keeps the prototype hash and PRNG deterministic", () => {
    expect(hashStr("banner-destiny")).toBe(3186749384);
    const random = prng(hashStr("food-r-one"));

    expect([random(), random(), random()].map((value) => value.toFixed(8))).toEqual([
      "0.62742401",
      "0.11444090",
      "0.19314125",
    ]);
  });

  it("builds glyph paths and node radii in the prototype PRNG order", () => {
    const data = createGlyphData("food-r-one");

    expect(data.path).toBe("M23.8 29.1 L66.7 61.3 L34.7 44.7 L20.3 16.3 L22.1 68.2");
    expect(data.nodes.map((node) => Number(node.radius.toFixed(4)))).toEqual([
      3.6,
      3.3907,
      2.4072,
      1.9087,
      2.5505,
    ]);
  });

  it("uses the exact adaptive wheel marker formula", () => {
    expect(getWheelMarkerSize(18)).toEqual({ markerSize: 36, iconSize: 20, radius: 111 });
    expect(getWheelMarkerSize(126)).toEqual({ markerSize: 13, iconSize: 7, radius: 123 });
  });

  it("computes five-turn wheel landings at the selected slice center", () => {
    expect(computeWheelRotation({ currentRotation: 123, entryCount: 4, targetIndex: 2 })).toBe(1935);
  });

  it("applies the ten-pull four-star floor when every weighted result is R", () => {
    const randoms = Array.from({ length: 10 }, () => 0).concat([0.01]);
    const draws = createDraws({
      count: 10,
      pool: foods,
      tenPullGuarantee: true,
      random: () => randoms.shift() ?? 0,
    });

    expect(draws).toHaveLength(10);
    expect(draws.slice(0, 9).every((draw) => draw.item.r === 3)).toBe(true);
    expect(draws[9].item.r).toBeGreaterThanOrEqual(4);
  });

  it("uses the handoff tier labels and colors", () => {
    expect(rarityTier(3)).toMatchObject({ code: "R", label: "优良", color: "#6cc6ff" });
    expect(rarityTier(4)).toMatchObject({ code: "SR", label: "稀有", color: "#c08cff" });
    expect(rarityTier(5)).toMatchObject({ code: "SSR", label: "传说", color: "#ffce6b" });
  });
});
