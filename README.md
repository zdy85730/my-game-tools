# My Game Tools

游戏相关网页工具集合仓库，优先采用纯前端工作流，必要时再为单个工具引入后端服务。

## Core Principles

- 前端默认使用 `Vite + React + TypeScript`
- 后端默认使用 `Fastify + TypeScript`
- 前端正式发布到 GitHub Pages
- 后端正式运行在 `82.156.192.108` 上的 Docker Compose
- 目录固定为 `游戏 / 工具 / frontend|backend`
- 所有页面统一使用仓库内设计系统，不允许各工具自带独立皮肤

## Workspace Layout

```text
portal/
packages/
  config/
  design-tokens/
  ui/
arcade/
  drop-rate-simulator/
    frontend/
sandbox/
  battle-lab/
    frontend/
    backend/
scripts/
.github/workflows/
```

## Common Commands

- `pnpm install`
- `pnpm dev:portal`
- `pnpm build:pages`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm new:tool --game <game> --tool <tool> --template frontend-only`

## Deployment

- `main` 分支合并后自动部署 GitHub Pages
- 变更的后端服务在 `main` 合并后通过 SSH 上传最小构建上下文，并在生产服务器本地执行 `docker compose up -d --build`
- 当前生产方案不使用付费容器镜像仓库；腾讯云服务器应为 Docker 配置免费镜像加速，例如 `https://mirror.ccs.tencentyun.com`
- 生产部署依赖 GitHub Secrets，详见 [CONTRIBUTING.md](./CONTRIBUTING.md)
