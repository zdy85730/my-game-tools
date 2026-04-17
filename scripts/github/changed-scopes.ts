import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { discoverTools } from '../tool-registry';

function getArg(name: string) {
  const index = process.argv.indexOf(`--${name}`);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function unique(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

const rootDir = resolve(process.cwd());
const base = getArg('base');
const head = getArg('head');

if (!base || !head) {
  throw new Error(
    'Usage: pnpm exec tsx scripts/github/changed-scopes.ts --base <sha> --head <sha>',
  );
}

const diffOutput = execFileSync('git', ['diff', '--name-only', base, head], {
  cwd: rootDir,
  encoding: 'utf8',
  shell: process.platform === 'win32',
});
const changedFiles = diffOutput
  .split('\n')
  .map((file) => file.trim())
  .filter(Boolean);
const tools = await discoverTools(rootDir);
const rootSensitivePaths = [
  '.github/',
  'packages/',
  'portal/',
  'scripts/',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'biome.json',
  'stylelint.config.cjs',
  'commitlint.config.cjs',
  'tsconfig.base.json',
];

const coreChanged = changedFiles.some((file) =>
  rootSensitivePaths.some((sensitivePath) =>
    sensitivePath.endsWith('/') ? file.startsWith(sensitivePath) : file === sensitivePath,
  ),
);
const affectedFrontends = coreChanged
  ? tools.map((tool) => tool.frontendPath)
  : tools
      .filter((tool) => changedFiles.some((file) => file.startsWith(`${tool.frontendPath}/`)))
      .map((tool) => tool.frontendPath);
const affectedBackends = coreChanged
  ? tools.map((tool) => tool.backendPath).filter((path): path is string => Boolean(path))
  : tools
      .filter(
        (tool) =>
          tool.backendPath && changedFiles.some((file) => file.startsWith(`${tool.backendPath}/`)),
      )
      .map((tool) => tool.backendPath as string);
const pagesAffected = coreChanged || changedFiles.some((file) => file.includes('/frontend/'));

const outputs = {
  changed_files: JSON.stringify(changedFiles),
  frontends: JSON.stringify(unique(affectedFrontends)),
  backends: JSON.stringify(unique(affectedBackends)),
  core_changed: String(coreChanged),
  pages_affected: String(pagesAffected),
};

if (process.env.GITHUB_OUTPUT) {
  for (const [key, value] of Object.entries(outputs)) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  }
}

console.log(JSON.stringify(outputs, null, 2));
