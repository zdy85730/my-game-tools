import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { resolvePortalBase } from '../packages/config/src/paths';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: resolvePortalBase(command),
  server: {
    port: 4173,
  },
}));
