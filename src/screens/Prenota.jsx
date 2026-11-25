import { useEffect, useState } from 'react'
import { getLezioni } from '../api'
import Modal from '../components/Modal'
import { giorniDaOggi, toISODate, nomeGiornoBreve, oraBreve } from '../dateUtils'

export default function Prenota({ giornoScelto, onCambiaGiorno, onSeleziona, onIndietro }) {
    const [giorni] = useState(() => giorniDaOggi(15)) // oggi + 14 giorni
    const [lezioni, setLezioni] = useState([])
    const [caricamento, setCaricamento] = useState(true)
    const [errore, setErrore] = useState('')
    const [popupCompleto, setPopupCompleto] = useState(false)

    useEffect(() => {
        getLezioni(toISODate(giorni[0]), toISODate(giorni[giorni.length - 1]))
            .then(setLezioni)
            .catch((e) => setErrore(e.message))
            .finally(() => setCaricamento(false))
    }, [giorni])

    const lezioniDelGiorno = lezioni.filter((l) => l.data_lezione === giornoScelto)

    return (
        <main className="prenota">
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

            <h1>Prenota la tua lezione!</h1>

            <div className="strip">
                {giorni.map((d, i) => {
                    const iso = toISODate(d)
                    const attivo = iso === giornoScelto
                    const oggi = i === 0
                    const nome = nomeGiornoBreve(d)
                    return (
                        <button
                            key={iso}
                            className={'giorno' + (attivo ? ' attivo' : '') + (oggi ? ' oggi' : '')}
                            aria-pressed={attivo}
                            onClick={() => onCambiaGiorno(iso)}
                        >
                            <span>{oggi ? 'oggi' : nome}</span>
                            <strong>{oggi ? `${nome},${d.getDate()}` : d.getDate()}</strong>
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
                    const completo = l.posti_liberi <= 0
                    return (
                        <button
                            key={l.id}
                            className={'card' + (completo ? ' completo' : '')}
                            style={{ animationDelay: `${0.45 + i * 0.1}s` }}
                            onClick={() => (completo ? setPopupCompleto(true) : onSeleziona(l))}
                        >
                            {completo ? (
                                <span className="badge-completo">COMPLETO</span>
                            ) : (
                                <span
                                    className="posti"
                                    role="img"
                                    aria-label={`${l.posti_liberi} posti liberi su ${l.capienza}`}
                                >
                                    {l.posti_liberi}/{l.capienza}
                                </span>
                            )}
                            <span className="card-ora">
                                {oraBreve(l.ora)}
                                <span>{l.durata_minuti} min</span>
                            </span>
                            <span className="card-insegnante">con {l.insegnante}</span>
                        </button>
                    )
                })}
            </div>

            {popupCompleto && (
                <Modal
                    titolo="Lezione al completo"
                    testo="Questa lezione ha già raggiunto il massimo numero di iscritti, si prega di sceglierne un’altra."
                    onChiudi={() => setPopupCompleto(false)}
                />
            )}
        </main>
    )
}