import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { version } from './package.json'

export default defineConfig({
  // Relative asset paths, so the build works under any sub-path
  // (e.g. GitHub Pages serves it from /bueffel/)
  base: './',
  // The version from package.json, shown in the About dialog
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [
    react(),
    VitePWA({
      // New versions are picked up on the next visit without asking
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        // Fixed identity: without it the browser identifies the app by its
        // start_url, so an older app installed from the same address (e.g. the
        // Deklination app on localhost) blocks installing this one
        id: 'bueffel',
        name: 'Büffel',
        short_name: 'Büffel',
        description: 'Practise German: declension of articles, adjectives and nouns, and more to come.',
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
