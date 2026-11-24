import { useEffect, useState } from 'react'
import { getLezioni } from '../api'
import Modal from '../components/Modal'
import { giorniDaOggi, toISODate, nomeGiornoBreve, oraBreve } from '../dateUtils'

export default function Prenota({ giornoScelto, onCambiaGiorno, onSeleziona }) {
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
            <h1>Prenota ora</h1>

            <div className="strip">
                {giorni.map((d, i) => {
                    const iso = toISODate(d)
                    const attivo = iso === giornoScelto
                    return (
                        <button
                            key={iso}
                            className={'giorno' + (attivo ? ' attivo' : '') + (i === 0 ? ' oggi' : '')}
                            aria-pressed={attivo}
                            onClick={() => onCambiaGiorno(iso)}
                        >
                            <span>{i === 0 ? 'oggi' : nomeGiornoBreve(d)}</span>
                            <strong>{d.getDate()}</strong>
                        </button>
                    )
                })}
            </div>

            {caricamento && <p>Caricamento…</p>}
            {errore && <p className="errore">{errore}</p>}
            {!caricamento && !errore && lezioniDelGiorno.length === 0 && (
                <p>Nessuna lezione in questo giorno.</p>
            )}

            {lezioniDelGiorno.map((l) => {
                const completo = l.posti_liberi <= 0
                return (
                    <button
                        key={l.id}
                        className={'card' + (completo ? ' completo' : '')}
                        onClick={() => (completo ? setPopupCompleto(true) : onSeleziona(l))}
                    >
                        {completo && <span className="badge-completo">COMPLETO</span>}
                        <span className="card-ora">
                            {oraBreve(l.ora)}
                            <span>{l.durata_minuti} min</span>
                        </span>
                        <span className="card-insegnante">con {l.insegnante}</span>
                        <span className="card-posti">
                            {completo ? 'Lezione al completo' : `${l.posti_liberi}/${l.capienza} posti liberi`}
                        </span>
                    </button>
                )
            })}

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