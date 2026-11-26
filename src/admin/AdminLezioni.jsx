import { useEffect, useState } from 'react'
import { adminGetLezioni } from '../api'
import { giorniDaOggi, toISODate, nomeGiornoBreve, oraBreve } from '../dateUtils'

// Una lezione è passata se è di un giorno precedente, oppure di oggi con orario già trascorso
function isPassata(l) {
    const adesso = new Date()
    const oggi = toISODate(adesso)
    if (l.data_lezione < oggi) return true
    if (l.data_lezione > oggi) return false
    const hh = String(adesso.getHours()).padStart(2, '0')
    const mm = String(adesso.getMinutes()).padStart(2, '0')
    return oraBreve(l.ora) <= `${hh}:${mm}`
}

export default function AdminLezioni({ nome, giornoScelto, onCambiaGiorno, onIndietro, onEsci }) {
    const [giorni] = useState(() => giorniDaOggi(15)) // oggi + 14 giorni
    const [lezioni, setLezioni] = useState([])
    const [caricamento, setCaricamento] = useState(true)
    const [errore, setErrore] = useState('')

    useEffect(() => {
        adminGetLezioni(toISODate(giorni[0]), toISODate(giorni[giorni.length - 1]))
            .then((righe) => {
                const attive = righe
                    .filter((l) => l.stato === 'programmata')
                    .sort((a, b) => (a.data_lezione + a.ora).localeCompare(b.data_lezione + b.ora))
                setLezioni(attive)
            })
            .catch((e) => setErrore(e.message))
            .finally(() => setCaricamento(false))
    }, [giorni])

    const lezioniDelGiorno = lezioni.filter((l) => l.data_lezione === giornoScelto)

    return (
        <main className="prenota">
            <div className="admin-testa">
                <button className="freccia" onClick={onIndietro} aria-label="Torna alla home">
                    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                        <path
                            d="M19 12H5M12 19l-7-7 7-7"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
                {/* PROVVISORIO: nel prossimo passo diventa il menu dei tre puntini */}
                <button className="btn-secondario" onClick={onEsci}>Esci</button>
            </div>

            <p className="benvenuta">Benvenuta, {nome}!</p>
            <h1>Le tue lezioni</h1>

            <div className="strip">
                {giorni.map((d, i) => {
                    const iso = toISODate(d)
                    const attivo = iso === giornoScelto
                    const oggi = i === 0
                    const nomeGiorno = nomeGiornoBreve(d)
                    return (
                        <button
                            key={iso}
                            className={'giorno' + (attivo ? ' attivo' : '') + (oggi ? ' oggi' : '')}
                            aria-pressed={attivo}
                            onClick={() => onCambiaGiorno(iso)}
                        >
                            <span>{oggi ? 'oggi' : nomeGiorno}</span>
                            <strong>{oggi ? `${nomeGiorno},${d.getDate()}` : d.getDate()}</strong>
                        </button>
                    )
                })}
            </div>

            <div className="lista">
                {caricamento && <p className="vuoto">Caricamento…</p>}
                {errore && <p className="vuoto errore">{errore}</p>}
                {!caricamento && !errore && lezioniDelGiorno.length === 0 && (
                    <p className="vuoto">Nessuna lezione in questo giorno.</p>
                )}

                {lezioniDelGiorno.map((l, i) => {
                    const passata = isPassata(l)
                    const liberi = l.capienza - l.prenotazioni_confermate
                    const completa = liberi <= 0

                    let badge
                    if (passata) {
                        badge = <span className="badge badge-passata">PASSATA</span>
                    } else if (completa) {
                        badge = <span className="badge badge-completo">COMPLETA</span>
                    } else {
                        badge = (
                            <span
                                className="badge badge-posti"
                                role="img"
                                aria-label={`${liberi} posti liberi su ${l.capienza}`}
                            >
                                {liberi}/{l.capienza}
                            </span>
                        )
                    }

                    return (
                        <button
                            key={l.id}
                            className={'card' + (passata || completa ? ' completo' : '')}
                            style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                        >
                            {badge}
                            <span className="card-ora">
                                {oraBreve(l.ora)}
                                <span>{l.durata_minuti} min</span>
                            </span>
                            <span className="card-insegnante">con {l.insegnante_nome}</span>
                        </button>
                    )
                })}
            </div>

            {/* Per ora non fa niente: lo colleghiamo al passo "Nuova lezione" */}
            <button className="btn-primario btn-largo btn-nuova">Nuova lezione</button>
        </main>
    )
}