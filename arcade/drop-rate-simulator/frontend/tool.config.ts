import { defineToolConfig } from '../../../packages/config/src/tool-config';

export default defineToolConfig({
  gameId: 'arcade',
  toolId: 'drop-rate-simulator',
  title: '掉落率模拟器',
  description: '用简洁的概率模型预估掉落次数与保底区间。',
  pagesPath: 'arcade/drop-rate-simulator',
  hasBackend: false,
  tags: ['概率', '掉落'],
  sortOrder: 10,
  themeVariant: 'default',
  status: 'stable',
  frontendDevPort: 4300,
});
