import { defineConfig } from 'vite';
import reactSwc from '@vitejs/plugin-react-swc';
// @ts-ignore
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [reactSwc(), tailwindcss()],
  root: '.',
  build: {
    outDir: 'dist',
  },
});