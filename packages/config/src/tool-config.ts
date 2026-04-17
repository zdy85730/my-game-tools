export type ThemeVariant = 'default' | 'dense';

export type ToolStatus = 'stable' | 'beta' | 'experimental';

export interface ToolConfig {
  gameId: string;
  toolId: string;
  title: string;
  description: string;
  pagesPath: string;
  hasBackend: boolean;
  tags?: string[];
  icon?: string;
  sortOrder?: number;
  themeVariant?: ThemeVariant;
  status?: ToolStatus;
  frontendDevPort?: number;
  backendDevPort?: number;
}

export interface ResolvedToolConfig extends ToolConfig {
  frontendPath: string;
  backendPath?: string;
}

export function defineToolConfig<T extends ToolConfig>(config: T): T {
  return config;
}

export function sortTools(tools: ResolvedToolConfig[]): ResolvedToolConfig[] {
  return [...tools].sort((left, right) => {
    const orderDelta = (left.sortOrder ?? 999) - (right.sortOrder ?? 999);

    if (orderDelta !== 0) {
      return orderDelta;
    }

    return left.title.localeCompare(right.title, 'zh-CN');
  });
}

export function groupToolsByGame(tools: ResolvedToolConfig[]): Map<string, ResolvedToolConfig[]> {
  return sortTools(tools).reduce((groups, tool) => {
    const gameTools = groups.get(tool.gameId) ?? [];

    gameTools.push(tool);
    groups.set(tool.gameId, gameTools);

    return groups;
  }, new Map<string, ResolvedToolConfig[]>());
}
