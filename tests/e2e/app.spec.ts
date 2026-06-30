import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("roulette and gacha flows work without inline add-food controls", async ({ page }) => {
  await expect(page).toHaveTitle(/今天吃啥 Gacha/);
  await expect(page.getByRole("heading", { name: "今天吃啥 Gacha" })).toBeVisible();
  await expect(page.getByText("本地保存")).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "保存食物" })).toHaveCount(0);

  await page.getByRole("button", { name: /开始转动/ }).click();
  await expect(page.locator(".winner-card strong")).toBeVisible({ timeout: 3_500 });
  await expect(page.getByTestId("result-status")).toContainText("转盘");
  await expect(page.locator(".history-list li").first()).toContainText(/大类转盘/);

  await page.getByRole("button", { name: "抽卡" }).click();
  await expect(page.getByRole("button", { name: "保存食物" })).toHaveCount(0);
  await page.getByRole("button", { name: "单抽" }).click();
  await expect(page.getByTestId("result-status")).toContainText("抽卡", { timeout: 4_000 });
  await expect(page.getByText(/权重/)).toHaveCount(0);
});

test("data management supports CRUD, search, filters, sort, and persistence", async ({ page }) => {
  await page.getByRole("button", { name: "数据管理" }).click();
  await expect(page.getByRole("heading", { name: "管理大类、标签和具体食物" })).toBeVisible();

  const manager = page.locator(".data-manager");
  const form = manager.locator(".manager-form");
  await expect(manager.getByText(/实物/)).toHaveCount(0);
  await expect(manager.getByText(/权重/)).toHaveCount(0);
  await expect(manager.getByLabel("来源筛选")).toHaveCount(0);
  await expect(manager.getByText("内置")).toHaveCount(0);
  await expect(manager.getByText("自定义")).toHaveCount(0);

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
  await manager.getByLabel("排序").selectOption({ label: "星级" });
  await manager.getByRole("button", { name: "升序" }).click();
  await expect(manager.getByRole("button", { name: "降序" })).toBeVisible();

  await manager.getByRole("button", { name: "编辑 松茸豆腐饭" }).click();
  await form.getByLabel("名称").fill("招牌松茸豆腐饭");
  await form.getByRole("button", { name: "保存修改" }).click();
  await expect(manager.getByText("招牌松茸豆腐饭")).toBeVisible();
  await manager.getByPlaceholder("搜索名称、标签、备注").fill("");

  await manager.getByRole("button", { name: "大类" }).click();
  await form.getByLabel("大类名称").fill("粤菜小炒");
  await form.getByLabel("图标").selectOption("rice");
  await form.getByLabel("顺序").fill("11");
  await form.getByRole("button", { name: "新增大类" }).click();
  await expect(manager.getByText("粤菜小炒")).toBeVisible();
  await manager.getByRole("button", { name: "编辑大类 粤菜小炒" }).click();
  await form.getByLabel("大类名称").fill("粤式小炒");
  await form.getByRole("button", { name: "保存大类" }).click();
  await expect(manager.getByText("粤式小炒")).toBeVisible();

  await manager.getByRole("button", { name: "标签" }).click();
  await form.getByLabel("标签名称").fill("海边想吃");
  await form.getByRole("button", { name: "新增标签" }).click();
  await expect(manager.getByText("海边想吃")).toBeVisible();
  await manager.getByRole("button", { name: "编辑标签 海边想吃" }).click();
  await form.getByLabel("标签名称").fill("海边备选");
  await form.getByRole("button", { name: "保存标签" }).click();
  await expect(manager.getByText("海边备选")).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "数据管理" }).click();
  await expect(manager.locator(".management-row").filter({ hasText: "招牌松茸豆腐饭" })).toBeVisible();
  await manager.getByRole("button", { name: "大类" }).click();
  await expect(manager.locator(".management-row").filter({ hasText: "粤式小炒" })).toBeVisible();
  await manager.getByRole("button", { name: "标签" }).click();
  await expect(manager.locator(".management-row").filter({ hasText: "海边备选" })).toBeVisible();

  await manager.getByRole("button", { name: "具体食物" }).click();
  await manager.getByRole("button", { name: "删除 招牌松茸豆腐饭" }).click();
  await expect(manager.getByText("招牌松茸豆腐饭")).toHaveCount(0);
  await manager.getByRole("button", { name: "大类" }).click();
  await manager.getByRole("button", { name: "删除大类 粤式小炒" }).click();
  await expect(manager.getByText("粤式小炒")).toHaveCount(0);
  await manager.getByRole("button", { name: "标签" }).click();
  await manager.getByRole("button", { name: "删除标签 海边备选" }).click();
  await expect(manager.getByText("海边备选")).toHaveCount(0);
});

test("disabled categories are omitted from the category wheel", async ({ page }) => {
  await page.getByRole("button", { name: "数据管理" }).click();
  const manager = page.locator(".data-manager");
  const form = manager.locator(".manager-form");

  await manager.getByRole("button", { name: "大类" }).click();
  await manager.getByRole("button", { name: "编辑大类 早餐早点" }).click();
  await form.getByLabel("参与大类转盘").uncheck();
  await form.getByRole("button", { name: "保存大类" }).click();

  await page.getByRole("button", { name: "转盘" }).click();
  await expect(page.getByTestId("wheel-marker")).toHaveCount(17);
  await expect(page.locator('[data-testid="wheel-marker"][aria-label^="早餐早点，"]')).toHaveCount(0);
  await expect(page.getByText("已从 17 个候选中选择")).toBeVisible();
});

test("new tags become available in wheel and gacha filters", async ({ page }) => {
  await page.getByRole("button", { name: "数据管理" }).click();
  const form = page.locator(".manager-form");

  await form.getByLabel("名称").fill("番茄牛腩饭");
  await form.getByLabel("标签").fill("番茄牛腩 独家标签");
  await form.getByRole("button", { name: "保存食物" }).click();

  await page.getByRole("button", { name: "转盘" }).click();
  await expect(page.getByRole("button", { name: "独家标签" })).toBeVisible();
});

test("wheel keeps segment names out of the spinning disc and previews names on marker click", async ({ page }) => {
  const markers = page.getByTestId("wheel-marker");
  const safeMarker = page.locator('[data-testid="wheel-marker"][aria-label^="日韩料理，"]');

  await expect(markers).toHaveCount(18);
  await expect(page.getByText("当前色块")).toHaveCount(0);
  await expect(safeMarker).toHaveCount(1);
  await expect(safeMarker).toHaveAccessibleName(/日韩料理/);

  for (const marker of await markers.all()) {
    await expect(marker).toHaveText("");
  }

  await safeMarker.click();
  await expect(page.getByTestId("wheel-selected-name")).toContainText("日韩料理");
  await expect(page.getByText("点选的候选")).toBeVisible();

  await page.getByRole("button", { name: /开始转动/ }).click();
  await expect(page.locator(".wheel-shell")).toHaveClass(/is-spinning/);

  for (const marker of await markers.all()) {
    await expect(marker).toHaveText("");
  }

  await expect(page.locator(".winner-card strong")).toBeVisible({ timeout: 3_500 });
  await expect(page.getByTestId("wheel-selected-name")).toBeVisible();
});

test("data management rows keep visible controls inside row boundaries", async ({ page }) => {
  await page.getByRole("button", { name: "数据管理" }).click();
  await expect(page.getByRole("heading", { name: "管理大类、标签和具体食物" })).toBeVisible();

  const issues = await page.locator(".management-list").evaluate((list) => {
    const rows = Array.from(list.querySelectorAll(".management-row"));
    return rows.flatMap((row, rowIndex) => {
      const rowRect = row.getBoundingClientRect();
      return Array.from(row.querySelectorAll(".favorite-toggle, .row-main, .row-metrics, .row-actions"))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const outside =
            rect.top < rowRect.top - 1 ||
            rect.bottom > rowRect.bottom + 1 ||
            rect.left < rowRect.left - 1 ||
            rect.right > rowRect.right + 1;

          return outside
            ? {
                rowIndex,
                className: element.className,
                rowTop: rowRect.top,
                rowBottom: rowRect.bottom,
                top: rect.top,
                bottom: rect.bottom,
              }
            : null;
        })
        .filter(Boolean);
    });
  });

  expect(issues).toEqual([]);
});

test("data management tabs stay usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "数据管理" }).click();

  const geometry = await page.locator(".data-tabs").evaluate((tabs) => {
    const tabRect = tabs.getBoundingClientRect();
    const buttonRects = Array.from(tabs.querySelectorAll("button")).map((button) => button.getBoundingClientRect());
    return {
      tabWidth: tabRect.width,
      parentWidth: tabs.parentElement?.getBoundingClientRect().width ?? 0,
      buttonTops: buttonRects.map((rect) => Math.round(rect.top)),
      minButtonWidth: Math.min(...buttonRects.map((rect) => rect.width)),
    };
  });

  expect(geometry.tabWidth).toBeGreaterThan(geometry.parentWidth * 0.9);
  expect(new Set(geometry.buttonTops).size).toBe(1);
  expect(geometry.minButtonWidth).toBeGreaterThan(90);
});

test("wheel markers stay centered in their slices and scale down for dense pools", async ({ page }) => {
  const denseCategories = [
    { id: "rice", name: "米饭", icon: "rice", color: "#ffb020", enabled: true, sortOrder: 1 },
    { id: "noodle", name: "面食", icon: "noodle", color: "#00d9ff", enabled: true, sortOrder: 2 },
    { id: "snack", name: "小吃", icon: "bolt", color: "#ff4dd8", enabled: true, sortOrder: 3 },
  ];
  const denseFoods = Array.from({ length: 24 }, (_, index) => ({
    id: `dense-${index + 1}`,
    name: `候选 ${index + 1}`,
    categoryId: denseCategories[index % denseCategories.length].id,
    tags: ["密集"],
    weight: 50,
    rarity: 3,
    enabled: true,
    createdAt: "2026-06-30T00:00:00.000Z",
  }));

  await page.evaluate(
    ({ categories, foods }) => {
      window.localStorage.setItem(
        "what-to-eat-gacha:v1",
        JSON.stringify({
          storageVersion: 3,
          categories,
          foods,
          tags: ["密集"],
          history: [],
          favorites: [],
          lastUsedAt: "2026-06-30T00:00:00.000Z",
        }),
      );
    },
    { categories: denseCategories, foods: denseFoods },
  );
  await page.reload();
  await page.getByRole("button", { name: /食物转盘/ }).click();
  await expect(page.getByTestId("wheel-marker")).toHaveCount(24);

  const geometry = await page.locator(".wheel-disc").evaluate((disc) => {
    const discRect = disc.getBoundingClientRect();
    const markers = Array.from(disc.querySelectorAll('[data-testid="wheel-marker"]'));
    const background = getComputedStyle(disc).backgroundImage;
    const startAngle = Number(background.match(/from (-?\d+(?:\.\d+)?)deg/)?.[1] ?? 0);
    const cx = discRect.left + discRect.width / 2;
    const cy = discRect.top + discRect.height / 2;
    const slice = 360 / markers.length;
    const markerData = markers.map((marker, index) => {
      const rect = marker.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const angle = (Math.atan2(x - cx, -(y - cy)) * 180) / Math.PI;
      const normalizedAngle = (angle + 360) % 360;
      const expected = (startAngle + slice * index + slice / 2 + 360) % 360;
      const delta = Math.abs(((normalizedAngle - expected + 540) % 360) - 180);
      return {
        x,
        y,
        width: rect.width,
        height: rect.height,
        delta,
      };
    });
    const centerGaps = markerData.map((marker, index) => {
      const next = markerData[(index + 1) % markerData.length];
      return Math.hypot(marker.x - next.x, marker.y - next.y);
    });

    return {
      pointerWidth: document.querySelector(".wheel-pointer")?.getBoundingClientRect().width ?? 0,
      markerSize: Math.max(...markerData.map((marker) => Math.max(marker.width, marker.height))),
      maxAlignmentError: Math.max(...markerData.map((marker) => marker.delta)),
      minCenterGap: Math.min(...centerGaps),
    };
  });

  expect(geometry.maxAlignmentError).toBeLessThan(2);
  expect(geometry.minCenterGap).toBeGreaterThanOrEqual(geometry.markerSize + 4);
  expect(geometry.pointerWidth).toBeLessThanOrEqual(geometry.markerSize * 1.5);
});

test("wheel mode buttons keep readable contrast in category and food modes", async ({ page }) => {
  await page.getByRole("button", { name: /食物转盘/ }).click();

  const contrastState = await page.locator(".segmented-control").evaluate((control) => {
    const parseRgb = (value: string) => {
      const match = value.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
      if (!match) return null;
      return {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3]),
        a: match[4] === undefined ? 1 : Number(match[4]),
      };
    };
    const relativeLuminance = ({ r, g, b }: { r: number; g: number; b: number }) => {
      const normalize = (channel: number) => {
        const value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
    };
    const contrast = (foreground: { r: number; g: number; b: number }, background: { r: number; g: number; b: number }) => {
      const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
      const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
      return (lighter + 0.05) / (darker + 0.05);
    };

    return Array.from(control.querySelectorAll("button")).map((button) => {
      const style = getComputedStyle(button);
      const color = parseRgb(style.color);
      const background = parseRgb(style.backgroundColor);
      const isActive = button.classList.contains("is-active");
      return {
        text: button.textContent?.trim(),
        isActive,
        backgroundAlpha: background?.a ?? 0,
        contrastAgainstExpectedSurface: color
          ? contrast(color, isActive ? { r: 183, g: 255, b: 42 } : { r: 3, g: 8, b: 14 })
          : 0,
      };
    });
  });

  expect(contrastState).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ text: "大类", isActive: false }),
      expect.objectContaining({ text: "食物", isActive: true }),
    ]),
  );
  for (const button of contrastState) {
    expect(button.backgroundAlpha).toBeGreaterThanOrEqual(button.isActive ? 0.9 : 0.5);
    expect(button.contrastAgainstExpectedSurface).toBeGreaterThanOrEqual(4.5);
  }
});

test("wheel result rarity stars stay horizontal", async ({ page }) => {
  await page.getByRole("button", { name: /食物转盘/ }).click();
  await page.getByRole("button", { name: /抽当前食物池/ }).click();

  const stars = page.locator(".winner-card .rarity-stars");
  await expect(stars).toBeVisible({ timeout: 3_500 });

  const layout = await stars.evaluate((node) => {
    const container = node.getBoundingClientRect();
    const children = Array.from(node.children).map((child) => child.getBoundingClientRect());
    return {
      width: container.width,
      height: container.height,
      firstTop: children[0]?.top ?? 0,
      lastTop: children.at(-1)?.top ?? 0,
      firstLeft: children[0]?.left ?? 0,
      lastLeft: children.at(-1)?.left ?? 0,
    };
  });

  expect(layout.width).toBeGreaterThan(layout.height * 2);
  expect(Math.abs(layout.firstTop - layout.lastTop)).toBeLessThan(2);
  expect(layout.lastLeft).toBeGreaterThan(layout.firstLeft);
});
