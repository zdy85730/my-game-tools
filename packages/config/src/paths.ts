export function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

function readPagesBase() {
  const maybeProcess = globalThis as { process?: { env?: Record<string, string | undefined> } };

  return maybeProcess.process?.env?.PAGES_BASE_PATH ?? '/';
}

export function resolvePagesBase(pagesPath: string, rootBase = readPagesBase()): string {
  const normalizedRoot = trimSlashes(rootBase);
  const normalizedPagesPath = trimSlashes(pagesPath);

  if (!normalizedRoot && !normalizedPagesPath) {
    return '/';
  }

  if (!normalizedRoot) {
    return `/${normalizedPagesPath}/`;
  }

  if (!normalizedPagesPath) {
    return `/${normalizedRoot}/`;
  }

  return `/${normalizedRoot}/${normalizedPagesPath}/`;
}

export function resolvePagesHref(pagesPath: string, rootBase = ''): string {
  return resolvePagesBase(pagesPath, rootBase);
}

export function resolveViteBase(
  pagesPath: string,
  command: 'serve' | 'build',
  rootBase = readPagesBase(),
): string {
  if (command === 'serve') {
    return '/';
  }

  return resolvePagesBase(pagesPath, rootBase);
}

export function resolvePortalBase(command: 'serve' | 'build', rootBase = readPagesBase()): string {
  if (command === 'serve') {
    return '/';
  }

  const normalizedRoot = trimSlashes(rootBase);

  return normalizedRoot ? `/${normalizedRoot}/` : '/';
}
