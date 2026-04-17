import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { resolveViteBase } from '../../../packages/config/src/paths';

import toolConfig from './tool.config';

const backendTarget = `http://127.0.0.1:${toolConfig.backendDevPort ?? 3301}`;

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: resolveViteBase(toolConfig.pagesPath, command),
  server: {
    port: toolConfig.frontendDevPort ?? 4301,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/healthz': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
}));
