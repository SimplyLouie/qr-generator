import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'QR Code Generator',
        short_name: 'QR Gen',
        description: 'Generate HD QR codes with your logo — free & instant',
        theme_color: '#7c3aed',
        icons: [
          {
            src: 'qr-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'qr-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  base: '/qr-generator/',
})
