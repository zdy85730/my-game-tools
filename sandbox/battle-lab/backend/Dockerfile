FROM node:22-alpine AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY sandbox/battle-lab/backend ./sandbox/battle-lab/backend

RUN pnpm install --filter @my-game-tools/sandbox-battle-lab-backend... --frozen-lockfile
RUN pnpm --dir sandbox/battle-lab/backend build

FROM node:22-alpine AS runtime

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY sandbox/battle-lab/backend/package.json ./sandbox/battle-lab/backend/package.json

RUN pnpm install --prod --filter @my-game-tools/sandbox-battle-lab-backend... --frozen-lockfile

COPY --from=build /app/sandbox/battle-lab/backend/dist ./sandbox/battle-lab/backend/dist

WORKDIR /app/sandbox/battle-lab/backend

EXPOSE 3301

CMD ["node", "dist/server.js"]
