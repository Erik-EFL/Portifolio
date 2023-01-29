const CACHE_NAME = `my-web-app-cache-${Date.now()}`;

const urlsToCache = [
  '/',
  '/dist/index.html',
  '/dist/assets/index.c175d860.css',
  '/dist/assets/index.1d5ceb87.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      try {
        cache.addAll(urlsToCache);
      } catch (err) {
        console.log('Error adding files to cache: ', err);
      }
    })
  );
});

self.addEventListener('fetch', event => {
  if (!(event.request.url.startsWith(self.location.origin)) || event.request.method !== 'GET') { return; }
  event.respondWith(async function() {
    try {
      const cacheResponse = await caches.match(event.request);
      if (cacheResponse) return cacheResponse;
      const freshResponse = await fetch(event.request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, freshResponse.clone());
      return freshResponse;
    } catch (error) {
      console.log('Error:', error);
    }
  }());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key.startsWith('my-web-app-cache-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })
  );
  event.waitUntil(self.clients.claim());
});
