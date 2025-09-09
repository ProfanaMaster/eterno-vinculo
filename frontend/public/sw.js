// Service Worker para Eterno Vínculo Admin
const CACHE_NAME = 'eterno-vinculo-admin-v1';

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requests solo para recursos estáticos
self.addEventListener('fetch', (event) => {
  // Solo cachear recursos estáticos, no APIs
  if (event.request.url.includes('/static/') || event.request.url.includes('.js') || event.request.url.includes('.css')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  }
});
