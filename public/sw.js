// VIT FoodHub Service Worker
// Enables PWA installation without offline data caching (requires live connection for ordering & Supabase)

const CACHE_NAME = 'vit-foodhub-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-only fetch policy to ensure real-time ordering and Supabase compatibility
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
