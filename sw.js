const CACHE_NAME = 'pragma-v17';
// Osobny, tymczasowy "schowek" na obraz udostępniony z innej aplikacji
// (patrz handleShareTarget niżej) — celowo NIE ten sam co CACHE_NAME, żeby
// czyszczenie starych wersji aplikacji (patrz "activate" niżej) nigdy
// przypadkiem nie skasowało obrazu, zanim strona zdąży go odebrać.
const SHARE_TARGET_CACHE = 'pragma-share-target-v1';
const ASSETS = [
  './',
  './index.html',
  './account.html',
  './scan.html',
  './style.css',
  './i18n.js',
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
        keys.filter((key) => key !== CACHE_NAME && key !== SHARE_TARGET_CACHE).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Przechwycenie udostępnienia z innej aplikacji (np. "Udostępnij" na zrzucie
// ekranu → wybór Pragmy z listy) — patrz manifest.json "share_target".
// Telefon wysyła to jako POST z plikiem w środku, bo GitHub Pages jest
// stroną statyczną i nie ma jak inaczej "przyjąć" przesłanego pliku — musimy
// sami wyjąć z tego obraz (i ewentualny tekst/link, jeśli to było
// udostępnienie tekstu, nie zdjęcia), przytrzymać obraz na chwilę w
// SHARE_TARGET_CACHE, i przekierować już zwykłym, prostym GET na stronę
// główną — dokładnie w tym samym formacie adresu, jakiego index.html już
// oczekiwał dla udostępnionego tekstu/linku (patrz tamtejsza sekcja
// "Przechwytywanie udostępnionego URL"), plus nowy parametr dla obrazu.
async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') || '';
    const text = formData.get('text') || '';
    const url = formData.get('url') || '';
    const file = formData.get('shared_image');

    const redirectParams = new URLSearchParams();
    if (title) redirectParams.set('title', title);
    if (text) redirectParams.set('text', text);
    if (url) redirectParams.set('url', url);

    if (file && file.size > 0 && file.type.indexOf('image/') === 0) {
      const cache = await caches.open(SHARE_TARGET_CACHE);
      await cache.put('/shared-image', new Response(file, { headers: { 'Content-Type': file.type } }));
      redirectParams.set('shared_image', '1');
    }

    const query = redirectParams.toString();
    return Response.redirect('./index.html' + (query ? '?' + query : ''), 303);
  } catch (err) {
    console.error('Pragma: błąd odbioru udostępnionej treści', err);
    return Response.redirect('./index.html', 303);
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname.endsWith('/index.html')) {
    event.respondWith(handleShareTarget(event.request));
    return;
  }

  // Ignoruj resztę żądań POST (np. do naszej funkcji analyze), cache'ujemy tylko GET
  if (event.request.method !== 'GET') return;

  const needsFreshContent =
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('manifest.json') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js');

  if (needsFreshContent) {
    // NETWORK-FIRST: HTML, manifest i style muszą zawsze być świeże, inaczej
    // zmiany wgrane na serwer nigdy nie dotrą do telefonu (tak jak stary
    // style.css utknął w cache'u aż do wersji pragma-v7). WAŻNE:
    // `cache: 'reload'` jest tu konieczne — zwykłe `fetch()` samo w sobie
    // wciąż może dostać odpowiedź z wewnętrznej pamięci podręcznej
    // przeglądarki (HTTP cache, niezależnej od Cache Storage Service
    // Workera) i NIGDY nie dotrzeć do sieci, jeśli GitHub Pages ustawił
    // czasowy nagłówek cache dla pliku — dokładnie ten mechanizm sprawiał,
    // że po zmianie style.css część telefonów dalej widziała stary wygląd
    // mimo podbicia CACHE_NAME (2026-08-18).
    event.respondWith(
      fetch(event.request, { cache: 'reload' })
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