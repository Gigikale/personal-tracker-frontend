// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(),
  ],
  esbuild: {
    loader: 'jsx',  // add this line
  },
  server: {
    open: false, // This prevents auto-opening the browser
  },
});
