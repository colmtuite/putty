import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { putty } from '../../src/vite.ts';

export default defineConfig({
  plugins: [putty(), react()],
  resolve: {
    // In a real project you'd `npm install puttycss`; here we point at the source.
    alias: { 'puttycss': path.resolve(import.meta.dirname, '../../src/index.ts') },
  },
});
