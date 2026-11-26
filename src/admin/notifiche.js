import { supabase } from '../supabaseClient'

const CHIAVE_PUBBLICA = import.meta.env.VITE_VAPID_PUBLIC_KEY

// La chiave pubblica arriva in un formato di testo, il telefono la vuole in numeri
function chiaveInNumeri(base64) {
    const riempimento = '='.repeat((4 - (base64.length % 4)) % 4)
    const normale = (base64 + riempimento).replace(/-/g, '+').replace(/_/g, '/')
    const grezzo = atob(normale)
    return Uint8Array.from(grezzo, (c) => c.charCodeAt(0))
}

function supportate() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

// 'attive' | 'spente' | 'bloccate' | 'non_supportate'
export async function statoNotifiche() {
    if (!supportate()) return 'non_supportate'
    if (Notification.permission === 'denied') return 'bloccate'
    const reg = await navigator.serviceWorker.getRegistration('/admin')
    const sub = reg ? await reg.pushManager.getSubscription() : null
    return sub && Notification.permission === 'granted' ? 'attive' : 'spente'
}

// Restituisce sempre { successo, messaggio }
export async function attivaNotifiche() {
    if (!supportate()) {
        return {
            successo: false,
            messaggio:
                'Questo dispositivo non supporta le notifiche. Su iPhone apri l’app dall’icona nella schermata Home.',
        }
    }
    if (!CHIAVE_PUBBLICA) {
        return { successo: false, messaggio: 'Configurazione notifiche mancante.' }
    }

    try {
        // Il permesso va chiesto subito, nel momento del tocco (richiesto da iPhone)
        const permesso = await Notification.requestPermission()
        if (permesso !== 'granted') {
            return {
                successo: false,
                messaggio: 'Permesso non concesso. Puoi attivarlo dalle impostazioni del telefono.',
            }
        }

        const reg = await navigator.serviceWorker.ready
        let sub = await reg.pushManager.getSubscription()
        if (!sub) {
            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: chiaveInNumeri(CHIAVE_PUBBLICA),
            })
        }

        const json = sub.toJSON()
        const { data, error } = await supabase.rpc('salva_iscrizione_notifiche', {
            p_endpoint: json.endpoint,
            p_p256dh: json.keys.p256dh,
            p_auth_key: json.keys.auth,
        })
        if (error) throw error

        const risultato = Array.isArray(data) ? data[0] : data
        return { successo: risultato.successo, messaggio: risultato.messaggio }
    } catch {
        return { successo: false, messaggio: 'Non è stato possibile attivare le notifiche. Riprova.' }
    }
}

export async function disattivaNotifiche() {
    try {
        const reg = await navigator.serviceWorker.getRegistration('/admin')
        const sub = reg ? await reg.pushManager.getSubscription() : null
        if (sub) {
            await supabase.rpc('rimuovi_iscrizione_notifiche', { p_endpoint: sub.endpoint })
            await sub.unsubscribe()
        }
        return { successo: true, messaggio: 'Notifiche disattivate.' }
    } catch {
        return { successo: false, messaggio: 'Non è stato possibile disattivare le notifiche. Riprova.' }
    }
}