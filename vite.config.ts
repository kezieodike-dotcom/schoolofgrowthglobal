import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Vite's HMR socket defaults to a fixed 24678, so a second project running
  // at the same time loses the port and hot reload silently stops working.
  // Derive it from PORT to keep each project's socket unique. PORT unset or
  // 3000 yields 24678, i.e. exactly Vite's default, so nothing changes for a
  // single-project setup.
  const hmrPort = Number(process.env.PORT || 3000) + 21678;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true' ? {port: hmrPort} : false,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
