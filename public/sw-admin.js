// Service worker dell'area admin.
// Mostra le notifiche di nuova prenotazione e apre l'app quando le tocchi.
// Non salva niente in cache, così le modifiche al sito si vedono subito.

self.addEventListener('install', () => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
    let dati = {}
    try {
        dati = event.data ? event.data.json() : {}
    } catch {
        dati = {}
    }

    // Su iPhone ogni push deve mostrare una notifica, altrimenti il sistema toglie l'iscrizione
    event.waitUntil(
        self.registration.showNotification(dati.titolo || 'Gestione prenotazioni', {
            body: dati.testo || '',
            icon: '/icon-admin-192.png',
            data: { url: dati.url || '/admin' },
        }),
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const url = (event.notification.data && event.notification.data.url) || '/admin'

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((finestre) => {
            for (const finestra of finestre) {
                if (finestra.url.includes('/admin') && 'focus' in finestra) return finestra.focus()
            }
            return self.clients.openWindow(url)
        }),
    )
})