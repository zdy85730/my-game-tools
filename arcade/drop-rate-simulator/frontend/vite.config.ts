import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { resolveViteBase } from '../../../packages/config/src/paths';

import toolConfig from './tool.config';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: resolveViteBase(toolConfig.pagesPath, command),
  server: {
    port: toolConfig.frontendDevPort ?? 4300,
  },
}));
