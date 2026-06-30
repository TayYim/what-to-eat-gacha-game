# Milestone Plan

## Milestone 1: Static App Scaffold

- Create Vite/React/TypeScript app files.
- Add Vitest, Playwright, and Wrangler config.
- Acceptance: app builds and serves locally.

## Milestone 2: Domain Logic

- Add food/category types, seed data, filtering, weighted random, and storage helpers.
- Add unit tests for filtering, random selection, storage fallback, and schema sanitization.
- Acceptance: `pnpm run test` passes.

## Milestone 3: Game UI

- Implement roulette stage, gacha stage, filters, custom food manager, history rail, and local persistence.
- Use CSS/lucide/text only; no realistic image assets in the app.
- Acceptance: browser screenshots show readable desktop/mobile game UI and zero `<img>` elements.

## Milestone 4: Verification And Deployment

- Add Playwright e2e for roulette, gacha, custom food persistence, and custom tag availability.
- Build and deploy with Cloudflare Wrangler static assets.
- Acceptance: `pnpm run build`, `pnpm run test:e2e`, `pnpm run cf:dry-run`, `pnpm run cf:deploy`, and remote `curl` checks pass.

## Cleanup Plan

- Stop local preview/Wrangler servers.
- Remove `test-results/` and `.wrangler/`.
- Preserve screenshots and reports under `.agent/runs/2026-06-30-what-to-eat-gacha/`.
