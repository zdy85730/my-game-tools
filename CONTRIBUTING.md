# Contributing

## Workflow

1. 从 `main` 拉出功能分支。
2. 在对应的 `游戏/工具/frontend` 或 `游戏/工具/backend` 下工作。
3. 提交前运行：
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
4. 使用 Conventional Commits。
5. 通过 Pull Request 合并到 `main`。

## Repository Rules

- 不直接提交到 `main`
- 纯前端优先，只有明确需要服务端能力时才创建 `backend`
- 所有 UI 必须消费 `@my-game-tools/design-tokens` 和 `@my-game-tools/ui`
- 不允许引入另一套主色、圆角、卡片和按钮语言

## Required Secrets

后端自动部署依赖以下 GitHub Secrets：

- `DEPLOY_HOST`
- `DEPLOY_PORT`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_BASE_PATH`
- `DEPLOY_FINGERPRINT`

后端部署不会将镜像推送到外部镜像仓库，而是通过 SSH 将后端的最小构建上下文同步到服务器，并在服务器本地执行 `docker compose up -d --build`。

对于腾讯云 CVM，建议在生产机的 Docker daemon 中配置免费镜像加速：

```json
{
  "registry-mirrors": ["https://mirror.ccs.tencentyun.com"]
}
```

否则远端本地构建可能会卡在 Docker Hub 基础镜像拉取阶段。

Pages 采用 GitHub Actions 官方部署链路，无需额外凭据。

## New Tool Checklist

新增工具时至少完成以下内容：

- 生成 `tool.config.ts`
- 选择 `frontend-only` 或 `frontend+backend` 模板
- 工具主页接入统一 `AppShell`
- 如有后端，提供 `GET /healthz`
- 如有后端，提供 `Dockerfile` 与 `deploy/compose.yaml`
