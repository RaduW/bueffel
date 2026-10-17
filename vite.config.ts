import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Relative asset paths, so the build works under any sub-path
  // (e.g. GitHub Pages serves it from /declination-practice/)
  base: './',
  plugins: [
    VitePWA({
      // New versions are picked up on the next visit without asking
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Deklination üben',
        short_name: 'Deklination',
        description: 'Practise German declination: articles, adjective endings and noun endings.',
        lang: 'de',
        start_url: './',
        scope: './',
        display: 'standalone',
        theme_color: '#2f5fd0',
        background_color: '#f6f5f1',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
