# Product Requirements Document

## Product Goal

Create a functional, testable, demonstrable web prototype that helps users decide what to eat through game-like roulette and gacha interactions.

## Target Users

- Chinese-speaking office workers and students.
- Users deciding lunch/dinner quickly.
- Users who enjoy playful/randomized decision tools.

## Functional Requirements

### Must-Have

- Simplified Chinese UI.
- Roulette mode with built-in food categories.
- Food roulette using the current filtered food pool.
- Gacha/card mode with weights, star rarity, and ten-draw guarantee.
- Built-in categories and seed foods.
- User-added foods with category, tags, weight, and star rating.
- Tag/category filtering.
- Local persistence for custom foods, history, and favorites.
- Game-like animation without sound.
- No realistic photos/images in the shipped UI.
- Cloudflare deployment test.

### Should-Have

- History rail.
- Favorites.
- Storage failure resilience.
- Desktop and mobile checks.

### Nice-To-Have

- Edit/import/export for custom foods.
- Richer staged summon choreography.
- Shareable result cards.
- Budget/location filters.

## Data Model

- `FoodCategory`: `id`, `name`, `icon`, `color`, `enabled`, `sortOrder`.
- `FoodItem`: `id`, `name`, `categoryId`, `tags`, `weight`, `rarity`, `enabled`, `notes`, `createdAt`, `custom`.
- `FoodFilterState`: selected categories, included tags, excluded tags, excluded foods.
- `StoredAppData`: version, custom foods, history, favorites, last used timestamp.

## System Boundaries

- Static frontend only.
- Browser-local persistence only.
- No login, backend database, or sound.
- Cloudflare deployment through Wrangler static assets.

## Success Criteria

- User can open the app and trigger a decision in one action.
- Both roulette and gacha modes work and feel distinct.
- User-added food persists after reload.
- Filters affect the candidate pool.
- Desktop/mobile e2e tests pass.
- Remote Cloudflare URL returns the built app.

## Risks And Assumptions

- localStorage is not a production-grade data layer.
- Rarity is currently presentation plus ten-draw guarantee, not a full gacha economy.
- External network is no longer required for fonts or images in the shipped UI.
