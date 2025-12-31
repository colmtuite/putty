import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { zeroCSSPlugin } from '../src/vite-plugin';
import { theme } from './theme';

export default defineConfig({
  plugins: [
    zeroCSSPlugin({
      theme,
      output: 'styles.css',
    }),
    react(),
  ],
});

