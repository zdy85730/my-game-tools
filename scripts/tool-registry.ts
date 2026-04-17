import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { type ResolvedToolConfig, type ToolConfig, sortTools } from '../packages/config/src/index';

const RESERVED_TOP_LEVEL_DIRECTORIES = new Set([
  '.git',
  '.github',
  '.husky',
  'node_modules',
  'packages',
  'portal',
  'scripts',
]);

export function normalizePath(filePath: string) {
  return filePath.replace(/\\/g, '/');
}

export async function discoverTools(rootDir = process.cwd()): Promise<ResolvedToolConfig[]> {
  const tools: ResolvedToolConfig[] = [];

  for (const gameEntry of readdirSync(rootDir, { withFileTypes: true })) {
    if (!gameEntry.isDirectory() || RESERVED_TOP_LEVEL_DIRECTORIES.has(gameEntry.name)) {
      continue;
    }

    const gameDir = join(rootDir, gameEntry.name);

    for (const toolEntry of readdirSync(gameDir, { withFileTypes: true })) {
      if (!toolEntry.isDirectory()) {
        continue;
      }

      const frontendDir = join(gameDir, toolEntry.name, 'frontend');
      const backendDir = join(gameDir, toolEntry.name, 'backend');
      const toolConfigPath = join(frontendDir, 'tool.config.ts');

      if (!existsSync(toolConfigPath)) {
        continue;
      }

      const imported = (await import(pathToFileURL(toolConfigPath).href)) as {
        default: ToolConfig;
      };
      const toolConfig = imported.default;

      tools.push({
        ...toolConfig,
        frontendPath: normalizePath(relative(rootDir, frontendDir)),
        backendPath: existsSync(backendDir)
          ? normalizePath(relative(rootDir, backendDir))
          : undefined,
      });
    }
  }

  return sortTools(tools);
}

export async function writeToolManifest(rootDir = process.cwd()) {
  const manifestPath = resolve(rootDir, 'portal/src/generated/tools.generated.json');
  const tools = await discoverTools(rootDir);

  writeFileSync(manifestPath, `${JSON.stringify(tools, null, 2)}\n`, 'utf8');

  return tools;
}
