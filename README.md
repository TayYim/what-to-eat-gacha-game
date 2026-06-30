# 今天吃啥 Gacha

一个简体中文网页原型，用转盘和抽卡两种游戏化方式帮用户快速决定吃什么。

## 本地运行

```bash
pnpm install
pnpm run dev
```

## 验证

```bash
pnpm run test
pnpm run build
pnpm run test:e2e
pnpm run cf:dry-run
```

## Cloudflare

原型按静态资源部署配置，`wrangler.jsonc` 指向 `dist/`。本地 Cloudflare 运行时可用：

```bash
pnpm run build
pnpm run cf:dev
```

实际发布需要本机已登录 Cloudflare Wrangler：

```bash
pnpm run cf:deploy
```
