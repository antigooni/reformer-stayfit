import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { adminGetPrenotazioni, adminAnnullaPrenotazione, adminAnnullaLezione } from '../api'
import { FOTO_LEZIONE } from '../config'
import { dataEstesa, oraBreve, giorniDaOggi, toISODate, lezionePassata } from '../dateUtils'
import { formattaTelefono } from '../telefono'
import BottomSheet from '../components/BottomSheet'
import Modal from '../components/Modal'
import { copiaTesto } from '../clipboard'
import ModificaLezione from './ModificaLezione'
import AggiungiPrenotazione from './AggiungiPrenotazione'

export default function AdminDettaglio({ lezione, onIndietro, onModificata, onAnnullata }) {
    const [prenotazioni, setPrenotazioni] = useState([])
    const [caricamento, setCaricamento] = useState(true)
    const [errore, setErrore] = useState('')
    const [versione, setVersione] = useState(0) // cambia per ricaricare l'elenco
    const [selezionata, setSelezionata] = useState(null)
    const [esitoCopia, setEsitoCopia] = useState(null) // null | 'ok' | 'errore'
    const [confermaAnnulla, setConfermaAnnulla] = useState(false)
    const [annullando, setAnnullando] = useState(false)
    const [erroreAnnulla, setErroreAnnulla] = useState('')
    const [aggiungiAperta, setAggiungiAperta] = useState(false)
    const [modificaAperta, setModificaAperta] = useState(false)
    const [confermaLezione, setConfermaLezione] = useState(false)
    const [annullandoLezione, setAnnullandoLezione] = useState(false)
    const [erroreLezione, setErroreLezione] = useState('')

    useEffect(() => {
        adminGetPrenotazioni(lezione.id)
            .then((righe) => {
                setPrenotazioni([...righe].sort((a, b) => a.created_at.localeCompare(b.created_at)))
                setErrore('')
            })
            .catch((e) => setErrore(e.message))
            .finally(() => setCaricamento(false))
    }, [lezione.id, versione])

    // Finché i dati non arrivano uso il numero che già conosco dalla lista delle lezioni
    const occupati = caricamento || errore ? lezione.prenotazioni_confermate : prenotazioni.length
    const passata = lezionePassata(lezione.data_lezione, lezione.ora)
    const dataMax = toISODate(giorniDaOggi(15)[14])

    function apri(p) {
        setEsitoCopia(null)
        setErroreAnnulla('')
        setSelezionata(p)
    }

    async function copia() {
        const ok = await copiaTesto('+39' + selezionata.telefono)
        setEsitoCopia(ok ? 'ok' : 'errore')
    }

    async function annulla() {
        if (annullando) return
        setConfermaAnnulla(false)
        setAnnullando(true)
        const risposta = await adminAnnullaPrenotazione(selezionata.prenotazione_id)
        setAnnullando(false)

        if (risposta.successo) {
            setSelezionata(null)
            setVersione((v) => v + 1)
        } else {
            setErroreAnnulla(risposta.messaggio)
        }
    }

    async function annullaLezione() {
        if (annullandoLezione) return
        setConfermaLezione(false)
        setAnnullandoLezione(true)
        const risposta = await adminAnnullaLezione(lezione.id)
        setAnnullandoLezione(false)

        if (risposta.successo) onAnnullata()
        else setErroreLezione(risposta.messaggio)
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

                    <div className="azioni">
                        <button
                            className="btn-primario"
                            disabled={passata}
                            onClick={() => setModificaAperta(true)}
                        >
                            Modifica lezione
                        </button>
                        <button className="btn-primario" onClick={() => setAggiungiAperta(true)}>
                            Aggiungi prenotazione
                        </button>
                        <button
                            className="btn-pericolo"
                            disabled={annullandoLezione}
                            onClick={() => setConfermaLezione(true)}
                        >
                            {annullandoLezione ? 'Annullamento…' : 'Cancella lezione'}
                        </button>
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

                    {erroreAnnulla && <p className="errore">{erroreAnnulla}</p>}

                    <div className="pannello-azioni">
                        <button
                            className="btn-rosso"
                            disabled={annullando}
                            onClick={() => setConfermaAnnulla(true)}
                        >
                            {annullando ? 'Annullamento…' : 'Cancella prenotazione'}
                        </button>
                        <button className="btn-primario" onClick={() => setSelezionata(null)}>
                            OK
                        </button>
                    </div>

                    {confermaAnnulla &&
                        createPortal(
                            <Modal
                                titolo="Cancellare la prenotazione?"
                                testo={`La prenotazione di ${selezionata.nome} verrà annullata e il posto tornerà libero.`}
                                etichettaAnnulla="Indietro"
                                etichettaConferma="Cancella"
                                onChiudi={() => setConfermaAnnulla(false)}
                                onConferma={annulla}
                            />,
                            document.body
                        )}
                </BottomSheet>
            )}

            {aggiungiAperta && (
                <BottomSheet titolo="Aggiungi prenotazione" onChiudi={() => setAggiungiAperta(false)}>
                    <AggiungiPrenotazione
                        lezioneId={lezione.id}
                        onAnnulla={() => setAggiungiAperta(false)}
                        onAggiunta={() => {
                            setAggiungiAperta(false)
                            setVersione((v) => v + 1)
                        }}
                    />
                </BottomSheet>
            )}

            {modificaAperta && (
                <BottomSheet titolo="Modifica lezione" onChiudi={() => setModificaAperta(false)}>
                    <ModificaLezione
                        lezione={lezione}
                        dataMax={dataMax}
                        prenotate={occupati}
                        onModificata={(d, o) => {
                            setModificaAperta(false)
                            onModificata(d, o)
                        }}
                    />
                </BottomSheet>
            )}

            {confermaLezione && (
                <Modal
                    titolo="Cancellare la lezione?"
                    testo={
                        `La lezione delle ${oraBreve(lezione.ora)} di ${dataEstesa(lezione.data_lezione)} verrà annullata.` +
                        (occupati > 0
                            ? ` ${occupati === 1 ? 'C’è 1 cliente prenotata' : `Ci sono ${occupati} clienti prenotate`}: ` +
                            'anche le loro prenotazioni verranno annullate. Si ricorda di avvisarle.'
                            : '')
                    }
                    etichettaAnnulla="Indietro"
                    etichettaConferma="Cancella"
                    onChiudi={() => setConfermaLezione(false)}
                    onConferma={annullaLezione}
                />
            )}

            {erroreLezione && (
                <Modal
                    titolo="Lezione non cancellata"
                    testo={erroreLezione}
                    onChiudi={() => setErroreLezione('')}
                />
            )}
        </main>
    )
}