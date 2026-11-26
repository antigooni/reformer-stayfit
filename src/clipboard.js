// Copia un testo negli appunti. Restituisce true se è riuscita.
export async function copiaTesto(testo) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(testo)
            return true
        }
    } catch {
        // provo il metodo di riserva qui sotto
    }

    try {
        const campo = document.createElement('textarea')
        campo.value = testo
        campo.setAttribute('readonly', '')
        campo.style.position = 'fixed'
        campo.style.opacity = '0'
        document.body.appendChild(campo)
        campo.select()
        campo.setSelectionRange(0, testo.length)
        const ok = document.execCommand('copy')
        document.body.removeChild(campo)
        return ok
    } catch {
        return false
    }
}