import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'


export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      manifest: false, 
      includeAssets: ['manifest.json', 'web-app-manifest-192x192.png', 'web-app-manifest-512x512.png'],
      workbox: {
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
        runtimeCaching: [
          {
            urlPattern: ({ url }: { url: URL }) => 
              url.pathname.includes('/routes/list') || 
              url.pathname.includes('/routes/shared') ||
              url.pathname.includes('/my-equipment/list'),
            handler: 'NetworkFirst',
            method: 'POST',
            options: {
              cacheName: 'api-agressive-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
              plugins: [{
                cacheKeyWillBeUsed: async ({ request }) => {
                  const body = await request.clone().text();
                  return new Request(`${request.url}/${body}`);
                }
              }]
            }
          },
          {
            urlPattern: ({ url }: { url: URL }) => 
              url.pathname.includes('/routes/') || 
              url.pathname.includes('/users/my'),
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'api-reactive-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 3 }
            }
          },
					{
						urlPattern: ({ request }) => request.destination === 'image',
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'images-cache',
							expiration: { 
								maxEntries: 100, 
								maxAgeSeconds: 60 * 60 * 24 * 30 
							}
						}
					}
        ]
      }
    })
  ],
})
