import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: './',
  define: { __EDITABLE_DIFFICULTIES__: JSON.stringify(mode === 'editor') },
  build: { outDir: mode === 'editor' ? 'dist-dev' : 'dist' },
}));
