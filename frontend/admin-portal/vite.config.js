import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    /*
     * Banner artwork must be emitted as files, never inlined.
     *
     * Each banner is a few hundred bytes under Vite's 4 KB inline threshold, so by default all
     * of them were base64'd into the entry chunk: ~70 KB of pictures that every visitor
     * downloads and parses before the first screen paints, and `loading="lazy"` on a data URI
     * means nothing. As files they are separate, cacheable, genuinely deferred requests.
     *
     * Everything else — the 400-byte logo, small icons — keeps the default and stays inline.
     */
    assetsInlineLimit: (filePath) => (filePath.includes('/images/') ? false : undefined),
    rollupOptions: {
      output: {
        // Split heavy third-party libraries into long-lived cache chunks.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          charts: ['recharts'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        },
      },
    },
  },
  server: {
    port: 5174,
  },
});
