import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const iconsJson = JSON.parse(
  readFileSync(new URL('./public/icons/icons.json', import.meta.url), 'utf-8')
) as { icons: Array<{ src: string; sizes: string }> }

const pwaIcons = iconsJson.icons
  .filter(({ src }) => src.startsWith('android/') || src.startsWith('windows11/'))
  .map(({ src, sizes }) => ({
    src: `/icons/${src}`,
    sizes,
    type: 'image/png',
    purpose: 'any'
  }))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: "Rubik's Cube Timer",
        short_name: "Rubik's Timer",
        description: "Professional timer for the Rubik's Cube with session management and statistics",
        theme_color: '#fde047',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: pwaIcons
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 anno
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
})
