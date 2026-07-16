import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Cache bucket names — kept in sync with @dgp/shared PWA_CACHE_NAMES.
const CACHE = {
  static: 'dgp-static-assets',
  images: 'dgp-images',
  api: 'dgp-api',
};

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // drives the in-app "update available" notification
      includeAssets: ['robots.txt', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Digital Gram Panchayat',
        short_name: 'DGP',
        description:
          'Complaints, notices, schemes, tax and certificates for Grampanchayat Sakharale.',
        lang: 'mr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#15803d',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App shell: precache the built HTML/JS/CSS and fall back to index.html for SPA
        // navigations so the app opens offline (CacheFirst-equivalent via precache).
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Static JS/CSS emitted at hashed URLs under /assets/ — StaleWhileRevalidate.
            //
            // Scoped to the build output path on purpose. The old rule matched EVERY
            // script/style, which in dev meant the service worker also cached Vite's
            // dep-optimizer chunks (/node_modules/.vite/deps/*?v=hash) and source modules.
            // After a lockfile change re-optimized deps, the SW served a mix of stale and
            // fresh module graphs — two React copies at runtime — and every lazy route
            // crashed with "Cannot read properties of null (reading 'useContext')".
            urlPattern: ({ url, request }) =>
              url.origin === self.location.origin &&
              url.pathname.startsWith('/assets/') &&
              (request.destination === 'script' || request.destination === 'style'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: CACHE.static },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: CACHE.images,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Read-mostly APIs the blueprint requires offline: notices, schemes, tax, profile.
            // NetworkFirst — fresh when online, last-good copy when offline.
            urlPattern: ({ url }) => /\/api\/v1\/(notices|schemes|tax|auth\/me)/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: CACHE.api,
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: true, // register SW in dev so offline behaviour is testable
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split large third-party libraries into their own long-lived cache chunks so the
        // main bundle stays small and vendor code isn't re-downloaded on every app update.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          motion: ['framer-motion'],
          leaflet: ['leaflet', 'react-leaflet'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
