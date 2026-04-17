import { defineToolConfig } from '../../../packages/config/src/tool-config';

export default defineToolConfig({
  gameId: 'sandbox',
  toolId: 'battle-lab',
  title: '战斗实验室',
  description: '带后端示例的策略面板，演示统一数据表与部署链路。',
  pagesPath: 'sandbox/battle-lab',
  hasBackend: true,
  tags: ['阵容', '接口'],
  sortOrder: 20,
  themeVariant: 'dense',
  status: 'beta',
  frontendDevPort: 4301,
  backendDevPort: 3301,
});
