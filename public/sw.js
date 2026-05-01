const CACHE_NAME = 'music-cache-v3'; // Změna verze vynutí aktualizaci u uživatele

// Seznam souborů, které se mají uložit pro offline start aplikace
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

// Při instalaci uložíme základní soubory webu
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Pokud máme soubor v cache (web nebo MP3), vrátíme ho hned
            if (cachedResponse) return cachedResponse;

            // Jinak jdeme na internet
            return fetch(event.request).then((networkResponse) => {
                // Pokud stahujeme MP3 nebo soubor z GitHubu, uložíme ho pro příště
                if (networkResponse.status === 200 && 
                    (event.request.url.includes('.mp3') || event.request.url.includes('raw.githubusercontent'))) {
                    
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            });
        })
    );
});