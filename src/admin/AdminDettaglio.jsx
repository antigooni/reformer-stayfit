import { useEffect, useState } from 'react'
import { adminGetPrenotazioni } from '../api'
import { FOTO_LEZIONE } from '../config'
import { dataEstesa, oraBreve } from '../dateUtils'
import BottomSheet from '../components/BottomSheet'
import { copiaTesto } from '../clipboard'

// "3331234567" diventa "333 123 4567"
function formattaTelefono(t) {
    return t.length === 10 ? `${t.slice(0, 3)} ${t.slice(3, 6)} ${t.slice(6)}` : t
}

export default function AdminDettaglio({ lezione, onIndietro }) {
    const [prenotazioni, setPrenotazioni] = useState([])
    const [caricamento, setCaricamento] = useState(true)
    const [errore, setErrore] = useState('')
    const [selezionata, setSelezionata] = useState(null)
    const [esitoCopia, setEsitoCopia] = useState(null) // null | 'ok' | 'errore'

    useEffect(() => {
        adminGetPrenotazioni(lezione.id)
            .then((righe) =>
                setPrenotazioni([...righe].sort((a, b) => a.created_at.localeCompare(b.created_at)))
            )
            .catch((e) => setErrore(e.message))
            .finally(() => setCaricamento(false))
    }, [lezione.id])

    // Finché i dati non arrivano uso il numero che già conosco dalla lista delle lezioni
    const occupati = caricamento || errore ? lezione.prenotazioni_confermate : prenotazioni.length

    function apri(p) {
        setEsitoCopia(null)
        setSelezionata(p)
    }

    async function copia() {
        const ok = await copiaTesto('+39' + selezionata.telefono)
        setEsitoCopia(ok ? 'ok' : 'errore')
    }

    return (
        <main className="dettaglio" style={{ backgroundImage: `url(${FOTO_LEZIONE})` }}>
            <div className="dettaglio-overlay" />
            <div className="dettaglio-inner">
                <div className="dettaglio-testa">
                    <button className="indietro" onClick={onIndietro} aria-label="Torna alle lezioni">
                        ←
                    </button>
                    <div className="dettaglio-titolo">
                        <h1 className="ora-grande">{oraBreve(lezione.ora)}</h1>
                        <p>
                            {dataEstesa(lezione.data_lezione)} · con {lezione.insegnante_nome}
                            <br />
                            {occupati}/{lezione.capienza} posti occupati
                        </p>
                    </div>
                </div>

                <div className="sheet sheet-admin">
                    {caricamento && <p className="vuoto-testo">Caricamento…</p>}
                    {errore && <p className="errore">{errore}</p>}
                    {!caricamento && !errore && prenotazioni.length === 0 && (
                        <p className="vuoto-testo">Nessuna prenotazione.</p>
                    )}

                    {prenotazioni.length > 0 && (
                        <div className="prenotati">
                            {prenotazioni.map((p) => (
                                <button key={p.prenotazione_id} className="prenotato" onClick={() => apri(p)}>
                                    <strong>{p.nome}</strong>
                                    <span>{formattaTelefono(p.telefono)}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Per ora i tre pulsanti non fanno niente: li colleghiamo nei prossimi passi */}
                    <div className="azioni">
                        <button className="btn-primario">Modifica lezione</button>
                        <button className="btn-primario">Aggiungi prenotazione</button>
                        <button className="btn-pericolo">Cancella lezione</button>
                    </div>
                </div>
            </div>

            {selezionata && (
                <BottomSheet titolo={selezionata.nome} onChiudi={() => setSelezionata(null)}>
                    <button
                        className="pannello-telefono"
                        onClick={copia}
                        aria-label="Copia il numero di telefono"
                    >
                        +39 {formattaTelefono(selezionata.telefono)}
                    </button>
                    <p className={'pannello-hint' + (esitoCopia === 'ok' ? ' ok' : '')} role="status">
                        {esitoCopia === 'ok' && 'Numero copiato!'}
                        {esitoCopia === 'errore' && 'Copia non riuscita.'}
                        {esitoCopia === null && 'Tocca il numero per copiarlo'}
                    </p>

                    {/* "Cancella prenotazione" lo colleghiamo al passo 10 */}
                    <div className="pannello-azioni">
                        <button className="btn-rosso">Cancella prenotazione</button>
                        <button className="btn-primario" onClick={() => setSelezionata(null)}>
                            OK
                        </button>
                    </div>
                </BottomSheet>
            )}
        </main>
    )
}