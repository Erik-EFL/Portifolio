const IS_DEV_SERVER = self.location.port === '5173';

const CACHE_NAME = `my-web-app-cache-${Date.now()}`;

const urlsToCache = [
  '/',
  '/dist/index.html',
  '/dist/assets/index.c175d860.css',
  '/dist/assets/index.1d5ceb87.js'
];

self.addEventListener('install', (event) => {
  // No dev server: ativação imediata para o self-destruct rodar já na próxima navegação
  if (IS_DEV_SERVER) {
    self.skipWaiting();
  }

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

self.addEventListener('fetch', (event) => {
  // No dev server: não intercepta nada — cachear aqui congelava a árvore antiga do Vite
  if (IS_DEV_SERVER) return;

  const request = event.request;

  // Cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cacheCopy);
          });
        }
        return networkResponse;
      });
    })
  );

  // Network-first strategy
  /*
  event.respondWith(
    fetch(request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const cacheCopy = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, cacheCopy);
        });
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(request);
    })
  );
  */

  // Stale-while-revalidate strategy
  /*
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
  */
});

/* self.addEventListener('fetch', event => {
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
}); */

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Limpa cache anterior (nome versionado por Date.now())
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => {
      if (IS_DEV_SERVER || (key.startsWith('my-web-app-cache-') && key !== CACHE_NAME)) {
        return caches.delete(key);
      }
    }));

    if (IS_DEV_SERVER) {
      // Autodestruição no dev server: mata o registro e recarrega as abas controladas
      await self.registration.unregister();
      const clientList = await self.clients.matchAll({ includeUncontrolled: true });
      clientList.forEach((client) => {
        try {
          client.navigate('/');
        } catch (err) {
          console.log('Error navigating client: ', err);
        }
      });
      return;
    }

    await self.clients.claim();
  })());
});