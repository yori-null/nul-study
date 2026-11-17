import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` keeps every asset path relative, so the built site works on
// any static host (Netlify, Vercel, GitHub Pages sub-folders, or a USB stick).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 800,
  },
});
