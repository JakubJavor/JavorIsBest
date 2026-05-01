const CACHE_NAME = 'music-cache-v4';
const ASSETS = ['/', '/index.html', '/style.css', '/app.js', '/manifest.json'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (response.status === 200 && (event.request.url.includes('.mp3') || event.request.url.includes('raw.githubusercontent'))) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
                }
                return response;
            });
        })
    );
});