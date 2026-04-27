const CACHE_NAME = 'educore-tps-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './logo.png'
];

// Install event: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-first approach to ensure fresh data
self.addEventListener('fetch', event => {
  // If it's an API call, we definitely want network only
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request)); 
    return;
  }

  // Network First strategy for other assets
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
