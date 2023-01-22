const version = 'v1'
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(version).then(cache => {
      return cache.addAll([
        '/',
        '/dist',
        '/dist/index.html',
        '/dist/assets/index.c175d860.css',
        '/dist/assets/index.1d5ceb87.js'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== version)
        .map(key => caches.delete(key))
      );
    })
  );
});
