import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("gacha home matches the handoff surface and menu opens history page", async ({ page }) => {
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

  await page.getByRole("button", { name: "打开菜单" }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "历史记录" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "数据管理" })).toBeVisible();
  await page.getByRole("menuitem", { name: "历史记录" }).click();
  await expect(page).toHaveURL(/#\/history$/);
  await expect(page.getByRole("heading", { name: "命运记录" })).toBeVisible();
  await expect(page.getByRole("button", { name: "主题色 #b89cff" })).toBeVisible();
  await expect(page.getByLabel("设置").getByText("十连保底 4★+")).toBeVisible();
  await expect(page.getByLabel("设置").getByText("星尘")).toBeVisible();
  await expect(page.getByText("尚无记录 —— 去召唤你的第一餐吧。")).toBeVisible();
});

test("menu navigates to data management and supports browse filter add persistence", async ({ page }) => {
  await page.getByRole("button", { name: "打开菜单" }).click();
  await page.getByRole("menuitem", { name: "数据管理" }).click();
  await expect(page).toHaveURL(/#\/data$/);
  await expect(page.getByRole("heading", { name: "管理大类、标签和具体食物" })).toBeVisible();

  const manager = page.locator(".data-manager");
  const form = manager.locator(".manager-form");
  await expect(manager.locator(".data-summary span").filter({ hasText: "食物" })).toContainText("126");
  await expect(manager.locator(".management-row").filter({ hasText: "黄焖鸡米饭" })).toBeVisible();

  await form.getByLabel("名称").fill("松茸豆腐饭");
  await form.getByLabel("标签").fill("下饭 想吃");
  await form.getByRole("button", { name: "5" }).click();
  await form.getByLabel("备注").fill("楼下能买到");
  await form.getByRole("button", { name: "保存食物" }).click();
  await expect(manager.locator(".management-row").filter({ hasText: "松茸豆腐饭" })).toBeVisible();

  await manager.getByPlaceholder("搜索名称、标签、备注").fill("松茸");
  await expect(manager.locator(".management-row").filter({ hasText: "松茸豆腐饭" })).toBeVisible();
  await manager.getByLabel("标签筛选").selectOption({ label: "想吃" });
  await expect(manager.locator(".management-row").filter({ hasText: "松茸豆腐饭" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "管理大类、标签和具体食物" })).toBeVisible();
  await expect(manager.locator(".management-row").filter({ hasText: "松茸豆腐饭" })).toBeVisible();

  await page.getByRole("button", { name: "返回召唤" }).click();
  await page.getByRole("button", { name: "命运转盘 WHEEL" }).click();
  await page.getByRole("button", { name: "食物转盘" }).click();
  await expect(page.getByText("已从 127 个候选中抉择")).toBeVisible();
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
  await page.getByRole("button", { name: "打开菜单" }).click();
  await page.getByRole("menuitem", { name: "历史记录" }).click();
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
