import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { writeToolManifest } from './tool-registry';

type TemplateKind = 'frontend-only' | 'frontend+backend';

interface ParsedArgs {
  game: string;
  tool: string;
  title: string;
  template: TemplateKind;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (!current.startsWith('--')) {
      continue;
    }

    args.set(current.slice(2), argv[index + 1] ?? '');
    index += 1;
  }

  const game = args.get('game')?.trim();
  const tool = args.get('tool')?.trim();
  const title =
    args.get('title')?.trim() ||
    tool
      ?.split('-')
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(' ');
  const template = (args.get('template')?.trim() || 'frontend-only') as TemplateKind;

  if (!game || !tool || !title) {
    throw new Error(
      'Usage: pnpm new:tool --game <game> --tool <tool> [--title <title>] [--template frontend-only|frontend+backend]',
    );
  }

  return { game, tool, title, template };
}

function nextPort(usedPorts: number[], fallback: number) {
  const maxPort = usedPorts.length > 0 ? Math.max(...usedPorts) : fallback - 1;

  return maxPort + 1;
}

function nextSortOrder(orders: number[]) {
  const maxOrder = orders.length > 0 ? Math.max(...orders) : 0;

  return maxOrder + 10;
}

function ensureDirectory(path: string) {
  mkdirSync(path, { recursive: true });
}

function writeFile(path: string, content: string) {
  ensureDirectory(dirname(path));
  writeFileSync(path, content.trimStart(), 'utf8');
}

function runCommand(rootDir: string, command: string, args: string[]) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const rootDir = resolve(process.cwd());
const args = parseArgs(process.argv.slice(2));
const tools = await writeToolManifest(rootDir);
const frontendPort = nextPort(
  tools
    .map((tool) => tool.frontendDevPort)
    .filter((value): value is number => typeof value === 'number'),
  4300,
);
const backendPort = nextPort(
  tools
    .map((tool) => tool.backendDevPort)
    .filter((value): value is number => typeof value === 'number'),
  3300,
);
const sortOrder = nextSortOrder(tools.map((tool) => tool.sortOrder ?? 0));
const toolDir = join(rootDir, args.game, args.tool);
const frontendDir = join(toolDir, 'frontend');
const backendDir = join(toolDir, 'backend');
const packagePrefix = `@my-game-tools/${args.game}-${args.tool}`;

writeFile(
  join(frontendDir, 'package.json'),
  `
{
  "name": "${packagePrefix}-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint:workspace": "pnpm exec biome check . && pnpm exec stylelint \\"src/**/*.css\\" --allow-empty-input",
    "typecheck": "pnpm exec tsc --noEmit -p tsconfig.app.json && pnpm exec tsc --noEmit -p tsconfig.node.json",
    "test": "node --test"
  },
  "dependencies": {
    "@my-game-tools/config": "workspace:*",
    "@my-game-tools/ui": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.4.1",
    "typescript": "^5.8.3",
    "vite": "^6.3.5"
  }
}
`,
);

writeFile(
  join(frontendDir, 'tool.config.ts'),
  `
import { defineToolConfig } from '../../../packages/config/src/tool-config';

export default defineToolConfig({
  gameId: '${args.game}',
  toolId: '${args.tool}',
  title: '${args.title}',
  description: '${args.title} 的统一模板页面，可在此基础上继续扩展业务逻辑。',
  pagesPath: '${args.game}/${args.tool}',
  hasBackend: ${args.template === 'frontend+backend'},
  sortOrder: ${sortOrder},
  themeVariant: 'default',
  status: 'experimental',
  frontendDevPort: ${frontendPort}${args.template === 'frontend+backend' ? `,\n  backendDevPort: ${backendPort}` : ''}
});
`,
);

writeFile(
  join(frontendDir, 'tsconfig.json'),
  `
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
`,
);

writeFile(
  join(frontendDir, 'tsconfig.app.json'),
  `
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
`,
);

writeFile(
  join(frontendDir, 'tsconfig.node.json'),
  `
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "types": ["node"]
  },
  "include": ["vite.config.ts", "tool.config.ts"]
}
`,
);

writeFile(
  join(frontendDir, 'vite.config.ts'),
  `
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { resolveViteBase } from '../../../packages/config/src/paths';

import toolConfig from './tool.config';

${args.template === 'frontend+backend' ? `const backendTarget = \`http://127.0.0.1:\${toolConfig.backendDevPort ?? ${backendPort}}\`;\n` : ''}
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: resolveViteBase(toolConfig.pagesPath, command),
  server: {
    port: toolConfig.frontendDevPort ?? ${frontendPort}${
      args.template === 'frontend+backend'
        ? `,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true
      },
      '/healthz': {
        target: backendTarget,
        changeOrigin: true
      }
    }`
        : ''
    }
  }
}));
`,
);

writeFile(
  join(frontendDir, 'index.html'),
  `
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>${args.title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="/src/main.tsx" type="module"></script>
  </body>
</html>
`,
);

writeFile(
  join(frontendDir, 'src/app.css'),
  `
.tool-template {
  display: grid;
  gap: var(--mgt-space-6);
}

.tool-template__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--mgt-space-5);
}
`,
);

writeFile(
  join(frontendDir, 'src/App.tsx'),
  `
import './app.css';

import { AppShell, FilterBar, PageHeader, Panel, PrimaryButton, StatCard } from '@my-game-tools/ui';

import toolConfig from '../tool.config';

export default function App() {
  const portalHref = import.meta.env.VITE_PORTAL_ROOT ?? '/';

  return (
    <AppShell
      brand={toolConfig.title}
      footer='Generated from the My Game Tools scaffold.'
      navigation={<a href={portalHref}>返回门户</a>}
    >
      <div className='tool-template'>
        <PageHeader
          actions={<PrimaryButton href={portalHref}>门户首页</PrimaryButton>}
          description={toolConfig.description}
          eyebrow='Scaffolded Tool'
          title={toolConfig.title}
        />

        <Panel description='这里保留统一筛选区，后续按业务扩展。' striped title='工作区起点'>
          <FilterBar>
            <label>
              示例筛选
              <input placeholder='在这里接入你的参数' />
            </label>
          </FilterBar>
        </Panel>

        <div className='tool-template__grid'>
          <StatCard hint='来自脚手架的默认统计卡。' label='Game' value={toolConfig.gameId} />
          <StatCard hint='当前工具标识。' label='Tool' value={toolConfig.toolId} />
          <StatCard hint='当前模板类型。' label='Backend' value={toolConfig.hasBackend ? 'Enabled' : 'Disabled'} />
        </div>
      </div>
    </AppShell>
  );
}
`,
);

writeFile(
  join(frontendDir, 'src/main.tsx'),
  `
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`,
);

if (args.template === 'frontend+backend') {
  writeFile(
    join(backendDir, 'package.json'),
    `
{
  "name": "${packagePrefix}-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm exec tsx watch src/server.ts",
    "build": "pnpm exec tsc -p tsconfig.build.json",
    "start": "node dist/server.js",
    "lint:workspace": "pnpm exec biome check .",
    "typecheck": "pnpm exec tsc --noEmit -p tsconfig.json",
    "test": "node --test"
  },
  "dependencies": {
    "@fastify/cors": "^10.0.2",
    "fastify": "^5.2.1"
  },
  "devDependencies": {
    "tsx": "^4.19.4",
    "typescript": "^5.8.3"
  }
}
`,
  );

  writeFile(
    join(backendDir, 'tsconfig.json'),
    `
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "types": ["node"],
    "moduleResolution": "NodeNext",
    "module": "NodeNext"
  },
  "include": ["src/**/*.ts"]
}
`,
  );

  writeFile(
    join(backendDir, 'tsconfig.build.json'),
    `
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "outDir": "dist",
    "sourceMap": true
  }
}
`,
  );

  writeFile(
    join(backendDir, 'src/server.ts'),
    `
import Fastify from 'fastify';
import cors from '@fastify/cors';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.get('/healthz', async () => ({
  status: 'ok',
  service: '${args.game}-${args.tool}'
}));

app.get('/api/records', async () => ({
  items: [
    { id: '1', label: 'sample-a', detail: 'Replace this with your own API payload.' },
    { id: '2', label: 'sample-b', detail: 'The scaffold keeps /healthz and /api/records ready.' }
  ]
}));

const port = Number(process.env.PORT ?? ${backendPort});
const host = process.env.HOST ?? '0.0.0.0';

await app.listen({ port, host });
`,
  );

  writeFile(
    join(backendDir, 'Dockerfile'),
    `
FROM node:22-alpine AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY ${args.game}/${args.tool}/backend ./${args.game}/${args.tool}/backend

RUN pnpm install --filter ${packagePrefix}-backend... --frozen-lockfile
RUN pnpm --dir ${args.game}/${args.tool}/backend build

FROM node:22-alpine AS runtime

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ${args.game}/${args.tool}/backend/package.json ./${args.game}/${args.tool}/backend/package.json

RUN pnpm install --prod --filter ${packagePrefix}-backend... --frozen-lockfile

COPY --from=build /app/${args.game}/${args.tool}/backend/dist ./${args.game}/${args.tool}/backend/dist

WORKDIR /app/${args.game}/${args.tool}/backend

EXPOSE ${backendPort}

CMD ["node", "dist/server.js"]
`,
  );

  writeFile(join(backendDir, '.env.example'), `HOST=0.0.0.0\nPORT=${backendPort}\n`);
  writeFile(join(backendDir, '.env.production.example'), `HOST=0.0.0.0\nPORT=${backendPort}\n`);
  writeFile(
    join(backendDir, 'deploy/compose.yaml'),
    `
services:
  ${args.game}-${args.tool}-backend:
    container_name: ${args.game}-${args.tool}-backend
    image: \${IMAGE_REF:?IMAGE_REF is required}
    restart: unless-stopped
    env_file:
      - ../.env.production
    ports:
      - '\${PORT:-${backendPort}}:${backendPort}'
`,
  );
}

await writeToolManifest(rootDir);
runCommand(rootDir, 'pnpm', ['exec', 'biome', 'check', toolDir, '--write']);
runCommand(rootDir, 'pnpm', ['install']);
