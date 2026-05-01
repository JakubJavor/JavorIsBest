const CACHE_NAME = 'music-cache-v2';

self.addEventListener('fetch', (event) => {
    // Cacheujeme vše, co končí .mp3 nebo jde z GitHubu
    if (event.request.url.includes('.mp3') || event.request.url.includes('raw.githubusercontent')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    return response || fetch(event.request).then((networkResponse) => {
                        // Uložíme kopii do paměti telefonu
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    }
});