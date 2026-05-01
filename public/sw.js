const CACHE_NAME = 'music-cache-v2';

// Upravená část sw.js pro lepší ukládání hudby
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('.mp3') || event.request.url.includes('raw.githubusercontent')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    if (response) return response; // Pokud je v paměti, hraj z paměti
                    
                    return fetch(event.request).then((networkResponse) => {
                        // DŮLEŽITÉ: Uložíme pouze pokud je odpověď v pořádku
                        if (networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            })
        );
    }
});