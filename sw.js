const CACHE_NAME = 'pragma-v6';
const ASSETS = [
  './',
  './index.html',
  './account.html',
  './scan.html',
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Pragma: Cache-owanie zasobów');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignoruj żądania POST (np. do naszej funkcji analyze), cache'ujemy tylko GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isHtmlOrManifest =
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('manifest.json');

  if (isHtmlOrManifest) {
    // NETWORK-FIRST: HTML i manifest muszą zawsze być świeże,
    // inaczej zmiany wgrane na serwer nigdy nie dotrą do telefonu.
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // CACHE-FIRST: statyczne pliki (ikony) mogą bezpiecznie być z cache
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});