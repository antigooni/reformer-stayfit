// Service worker dell'area admin.
// Per ora non fa nulla: serve a prepararci alle notifiche (passo 14).
// Non salva niente in cache, così le modifiche al sito si vedono subito.

self.addEventListener('install', () => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})