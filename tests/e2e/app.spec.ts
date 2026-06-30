import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("gacha home matches the handoff surface and history drawer opens", async ({ page }) => {
  await expect(page).toHaveTitle(/今天吃啥 Gacha/);
  await expect(page.getByRole("heading", { name: /今天吃啥.*召唤/ })).toBeVisible();
  await expect(page.getByText("DESTINY GACHA")).toBeVisible();
  await expect(page.getByRole("button", { name: "卡池抽卡 SUMMON" })).toBeVisible();
  await expect(page.getByRole("button", { name: "卡池抽卡 SUMMON" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "命运转盘 WHEEL" })).toBeVisible();
  await expect(page.getByRole("button", { name: "命运转盘 WHEEL" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("LIMITED BANNER")).toBeVisible();
  await expect(page.getByText("限定 · 今日卡池")).toBeVisible();
  await expect(page.getByText("RARITY WEIGHTS · 稀有度权重")).toBeVisible();
  await expect(page.getByRole("button", { name: /早餐早点/ })).toBeVisible();

  await page.getByRole("button", { name: "历史记录" }).click();
  await expect(page.getByRole("heading", { name: "命运记录" })).toBeVisible();
  await expect(page.getByRole("button", { name: "主题色 #b89cff" })).toBeVisible();
  await expect(page.getByLabel("设置").getByText("十连保底 4★+")).toBeVisible();
  await expect(page.getByLabel("设置").getByText("星尘")).toBeVisible();
  await expect(page.getByText("尚无记录 —— 去召唤你的第一餐吧。")).toBeVisible();
});

test("ten-pull reveal can be skipped and creates a last summon card", async ({ page }) => {
  await page.getByRole("button", { name: "十连召唤 SUMMON ×10" }).click();
  await expect(page.getByText("SUMMONING")).toBeVisible();
  await expect(page.getByText("命运正在汇聚…")).toBeVisible();
  await expect(page.getByRole("button", { name: /跳过/ })).toBeVisible({ timeout: 3_000 });
  await page.getByRole("button", { name: /跳过/ }).click();
  await expect(page.getByRole("button", { name: "完成" })).toBeVisible();
  await expect(page.getByRole("button", { name: "再抽十连" })).toBeVisible();
  await page.getByRole("button", { name: "完成" }).click();

  await expect(page.getByText(/上次召唤 · (R|SR|SSR)/)).toBeVisible();
  await page.getByRole("button", { name: "历史记录" }).click();
  await expect(page.locator("[data-testid='history-row']").first()).toContainText(/单抽召唤|十连召唤|SSR|SR|R/);
});

test("wheel food mode spins from the active pool", async ({ page }) => {
  await page.getByRole("button", { name: "命运转盘 WHEEL" }).click();
  await page.getByRole("button", { name: "食物转盘" }).click();

  await expect(page.getByText("已从 126 个候选中抉择")).toBeVisible();
  await expect(page.getByTestId("wheel-marker")).toHaveCount(126);
  await page.getByRole("button", { name: "抽取当前食物池" }).click();

  await expect(page.getByText(/权重 (94|5|1)/)).toBeVisible({ timeout: 2_500 });
  await expect(page.getByText("RESULT")).toBeVisible();
});

test("category chips can empty the pool and disable draw actions", async ({ page }) => {
  for (const chip of await page.getByTestId("category-chip").all()) {
    await chip.click();
  }

  await expect(page.getByRole("button", { name: "单抽 ×1" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "十连召唤 SUMMON ×10" })).toBeDisabled();
  await page.getByRole("button", { name: "命运转盘 WHEEL" }).click();
  await expect(page.getByRole("button", { name: "转动命运转盘" })).toBeDisabled();
  await expect(page.getByText("已从 0 个候选中抉择")).toBeVisible();
});

test("reduced motion collapses summon and wheel waits", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  await page.getByRole("button", { name: "十连召唤 SUMMON ×10" }).click();
  await expect(page.getByText("十连召唤结果 · 10/10")).toBeVisible({ timeout: 1_000 });
  await page.getByRole("button", { name: "完成" }).click();
  await expect(page.getByText(/上次召唤 · (R|SR|SSR)/)).toBeVisible();

  await page.getByRole("button", { name: "命运转盘 WHEEL" }).click();
  await page.getByRole("button", { name: "食物转盘" }).click();
  await page.getByRole("button", { name: "抽取当前食物池" }).click();
  await expect(page.getByText(/权重 (94|5|1)/)).toBeVisible({ timeout: 1_000 });
});
