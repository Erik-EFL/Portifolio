const CACHE_NAME = 'my-web-app-cache';

const urlsToCache = [
  '/',
  '/dist/index.html',
  '/dist/assets/index.c175d860.css',
  '/dist/assets/index.1d5ceb87.js'
];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache);
      }).catch((error) => console.error(error))
    );
  });

  self.addEventListener('fetch', event => {
    if (!event.request.url.match(/^http/) || event.request.method !== 'GET') { return; }
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }).catch((error) => console.error(error))
    );
  });

  self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(keys => {
        return Promise.all(keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
        );
      })
    );
    event.waitUntil(self.clients.claim());
  });
