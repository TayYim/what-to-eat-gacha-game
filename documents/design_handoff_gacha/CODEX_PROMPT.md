# Codex task — Rebuild the front-end for 今天吃啥 · 召唤 (What-to-eat Gacha)

## Your task
Replace the existing front-end of this app with a faithful, pixel-accurate implementation of the
design in this handoff bundle. **Discard the previous front-end UI** and rebuild it from scratch to
match the prototype, while keeping the project's existing data layer / RNG conventions where they
already line up with the spec (the prototype comments reference `App.tsx`, `random.ts`, and
`getWheelMarkerSize`, so this is a refinement of that codebase — use it).

Do **not** ship the prototype HTML or its `support.js`. Those are a design reference and a viewer.
Reimplement everything as real components in **this repo's existing stack** (React + TypeScript,
matching the patterns already present). Keep state, RNG, and data in idiomatic modules.

## Read these first, in order
1. `Gacha-standalone.html` — open in a browser to experience the motion and feel.
2. `README.md` — the complete spec: every screen, token, timing, and the state model.
3. `source/Gacha.dc.html` — the authoritative implementation. All logic is in the
   `class Component` block: `hashStr`, `prng`, `glyph` (procedural art), the starfield `canvasRef`
   loop, `pickWeighted`, the wheel math, and the reveal scheduler. Lift exact constants from here.
4. `data/food-data.ts` — drop-in content (18 categories, 126 dishes) + `rarityWeight` / `tierCode`.
5. `reference_screens/*.png` — per-state visual targets.

## How to hit "exactly like the design"
- **Port the procedural artwork verbatim.** Copy `hashStr` (FNV-1a), `prng` (mulberry32-style), and
  `glyph()` with identical constants and node math. The constellation icons must come out
  pixel-identical per seed (`cat-<id>`, `food-<id>`, `banner-destiny`). Same for the starfield loop.
  Do **not** substitute emoji or icon fonts — the constellations ARE the art.
- **Copy the exact values:** hex colors, gradients, radii, font sizes/weights/letter-spacing, the
  `@keyframes`, and every motion duration/easing (summon 1700ms; reveal dwell SSR 760 / SR 560 /
  R 300ms; flash 700ms; wheel spin 1750ms `cubic-bezier(.12,.74,.06,1)`, 5 turns + land at top;
  drawer .32s; card flip `tw-pop` .5s). These are listed in README → Design tokens and in the
  prototype `<style>` + logic.
- **Match the layout:** single centered column, max-width 480px, mobile-first; fixed bottom action
  bar on the gacha tab; bottom-sheet history drawer; full-screen summon overlay.
- **Reuse the data file** as the content source; keep the kebab-case dish IDs stable.
- **Keep the gacha math identical:** weighted pull (R 94 / SR 5 / SSR 1), ten-pull 4★+ pity floor
  (behind the `tenPullGuarantee` flag), `auraRarity` = max rarity drawn.
- **Wheel marker sizing** must use `mSize = max(13, min(42, floor(660/n)))` so the food wheel stays
  legible at 100+ entries.
- **Configurable props:** expose `accent` (theme color), `tenPullGuarantee` (boolean), and
  `particleDensity` (0.3–2) as real options/settings.
- **Accessibility:** honor `prefers-reduced-motion` (freeze animations); keep tap targets ≥ 44px;
  keep the existing `aria-label`s (e.g. history button).

## Acceptance criteria
- [ ] Old front-end UI removed; new UI matches the prototype on every screen in `reference_screens/`.
- [ ] Two tabs work: **卡池抽卡** (gacha) and **命运转盘** (wheel), with the stacked CN/Latin labels and active-gradient state.
- [ ] Category chip row toggles the active pool; emptying the pool disables the draw/spin actions (40% opacity, non-interactive).
- [ ] Single + ten-pull run the full overlay flow: summoning (aura color = top rarity) → one-by-one reveal with flip + shine, SSR gold screen flash, working **跳过 / 完成 / 再抽十连**.
- [ ] Ten-pull guarantees a 4★+ result when `tenPullGuarantee` is on; weights are R 94 / SR 5 / SSR 1.
- [ ] "Last summon" card appears after a pull, tinted by the best result's tier.
- [ ] Wheel: category & food modes; disc built from category colors; pointer + rotating dashed ring + hub 命; spins 1750ms with the specified easing and lands the picked slice under the pointer; adaptive marker sizing; result card with correct meta line.
- [ ] History drawer slides up over a blurred scrim, lists the most recent 30 events with tier/WHEEL codes, has the correct empty state, and the 史 button + scrim toggle it.
- [ ] Procedural glyphs + starfield are ported (not replaced) and render identically to the prototype.
- [ ] `accent`, `tenPullGuarantee`, `particleDensity` are configurable; `prefers-reduced-motion` is respected.
- [ ] All copy strings match the prototype exactly (see README for the Chinese/Latin labels).
- [ ] Type-checks, lints, and builds clean in the existing project; data comes from the shared data module.

## Out of scope / notes
- No backend or persistence is specified beyond in-memory state (history resets on reload) unless the
  existing app already persists — if so, follow its convention.
- The standalone build renders with a **gold** accent because the prototype runtime defaults unset
  props to gold; treat `accent` as a first-class configurable value (design default `#b89cff`).
