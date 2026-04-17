import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { normalizePath, writeToolManifest } from './tool-registry';

function parseRepositoryName(remoteUrl: string) {
  const normalized = remoteUrl.trim().replace(/\.git$/, '');

  if (normalized.startsWith('git@')) {
    return normalized.split(':').at(-1)?.split('/').at(-1);
  }

  return normalized.split('/').at(-1);
}

function resolveRepositorySlug(rootDir: string) {
  const remote = spawnSync('git', ['config', '--get', 'remote.origin.url'], {
    cwd: rootDir,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  const repositoryName = remote.status === 0 ? parseRepositoryName(remote.stdout) : undefined;
  const fallbackName = normalizePath(rootDir).split('/').at(-1) ?? 'my-game-tools';
  const finalRepositoryName = repositoryName || fallbackName;

  return finalRepositoryName.endsWith('.github.io') ? '' : finalRepositoryName;
}

function runPnpm(rootDir: string, args: string[], extraEnv: Record<string, string>) {
  const result = spawnSync('pnpm', args, {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...extraEnv,
    },
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function copyDist(sourceDir: string, targetDir: string) {
  rmSync(targetDir, { force: true, recursive: true });
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

const rootDir = resolve(process.cwd());
const outputDir = join(rootDir, '.pages-dist');
const repoSlug = resolveRepositorySlug(rootDir);
const portalRoot = repoSlug ? `/${repoSlug}/` : '/';
const buildEnv = {
  PAGES_BASE_PATH: repoSlug,
  VITE_PORTAL_ROOT: portalRoot,
};

const tools = await writeToolManifest(rootDir);

rmSync(outputDir, { force: true, recursive: true });
mkdirSync(outputDir, { recursive: true });

runPnpm(rootDir, ['--dir', 'portal', 'build'], buildEnv);
copyDist(join(rootDir, 'portal/dist'), outputDir);

for (const tool of tools) {
  runPnpm(rootDir, ['--dir', tool.frontendPath, 'build'], buildEnv);
  copyDist(join(rootDir, tool.frontendPath, 'dist'), join(outputDir, tool.pagesPath));
}

writeFileSync(join(outputDir, '.nojekyll'), '', 'utf8');
