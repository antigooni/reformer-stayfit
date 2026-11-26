// Data locale in formato AAAA-MM-GG (non usare toISOString: converte in UTC)
export function toISODate(d) {
    const anno = d.getFullYear()
    const mese = String(d.getMonth() + 1).padStart(2, '0')
    const giorno = String(d.getDate()).padStart(2, '0')
    return `${anno}-${mese}-${giorno}`
}

// Da "2026-11-25" a oggetto Date locale
export function parseISODate(iso) {
    const [anno, mese, giorno] = iso.split('-').map(Number)
    return new Date(anno, mese - 1, giorno)
}

// n date a partire da oggi
export function giorniDaOggi(n) {
    const oggi = new Date()
    return Array.from({ length: n }, (_, i) =>
        new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + i)
    )
}

// "lun", "mar"...
export function nomeGiornoBreve(d) {
    return d.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '')
}

// "Lunedì 23 novembre"
export function dataEstesa(iso) {
    const testo = parseISODate(iso).toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    })
    return testo.charAt(0).toUpperCase() + testo.slice(1)
}

// "09:00:00" diventa "09:00"
export function oraBreve(ora) {
    return ora.slice(0, 5)
}

// Vera se la lezione (data AAAA-MM-GG, ora "HH:MM" o "HH:MM:SS") è già iniziata
export function lezionePassata(dataISO, ora) {
    const adesso = new Date()
    const oggi = toISODate(adesso)
    if (dataISO < oggi) return true
    if (dataISO > oggi) return false
    const hh = String(adesso.getHours()).padStart(2, '0')
    const mm = String(adesso.getMinutes()).padStart(2, '0')
    return oraBreve(ora) <= `${hh}:${mm}`
}