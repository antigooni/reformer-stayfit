// Tiene solo le cifre; se incollano +39... toglie il prefisso; massimo 10 cifre
export function pulisciTelefono(valore) {
    let cifre = valore.replace(/\D/g, '')
    if (cifre.length > 10 && cifre.startsWith('39')) cifre = cifre.slice(2)
    return cifre.slice(0, 10)
}

// "3331234567" diventa "333 123 4567"
export function formattaTelefono(t) {
    return t.length === 10 ? `${t.slice(0, 3)} ${t.slice(3, 6)} ${t.slice(6)}` : t
}