import { useState } from 'react'
import { adminCreaLezione } from '../api'
import { ISTRUTTRICI } from '../config'
import { toISODate } from '../dateUtils'
import { creaOnda } from '../ripple'

export default function NuovaLezione({ ruolo, dataIniziale, dataMax, onCreata }) {
    const [data, setData] = useState(dataIniziale)
    const [ora, setOra] = useState('')
    const [insegnanteId, setInsegnanteId] = useState('')
    const [inviando, setInviando] = useState(false)
    const [errore, setErrore] = useState('')

    const adesso = new Date()
    const oggi = toISODate(adesso)
    const oraAdesso =
        String(adesso.getHours()).padStart(2, '0') + ':' + String(adesso.getMinutes()).padStart(2, '0')
    const proprietaria = ruolo === 'proprietario'

    async function crea(e) {
        e.preventDefault()
        if (inviando) return

        // Controlli rapidi per l'utente: quelli veri li rifà il database
        if (!data) return setErrore('Scegli una data.')
        if (data < oggi) return setErrore('Non puoi creare una lezione nel passato.')
        if (data > dataMax) return setErrore('Puoi creare lezioni entro i prossimi 14 giorni.')
        if (!ora) return setErrore('Scegli un orario.')
        if (data === oggi && ora <= oraAdesso) return setErrore('Scegli un orario non ancora passato.')
        if (proprietaria && !insegnanteId) return setErrore('Scegli l’istruttrice.')

        setErrore('')
        setInviando(true)
        const risposta = await adminCreaLezione(data, ora, proprietaria ? insegnanteId : null)
        setInviando(false)

        if (risposta.successo) onCreata(data)
        else setErrore(risposta.messaggio)
    }

    return (
        <form onSubmit={crea} noValidate>
            <div className="campo">
                <label htmlFor="nl-data">Data</label>
                <input
                    id="nl-data"
                    className="input"
                    type="date"
                    min={oggi}
                    max={dataMax}
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                />
            </div>

            <div className="campo">
                <label htmlFor="nl-ora">Ora</label>
                <input
                    id="nl-ora"
                    className="input"
                    type="time"
                    min={data === oggi ? oraAdesso : undefined}
                    value={ora}
                    onChange={(e) => setOra(e.target.value)}
                />
            </div>

            {proprietaria && (
                <div className="campo">
                    <label htmlFor="nl-istruttrice">Istruttrice</label>
                    <select
                        id="nl-istruttrice"
                        className="input"
                        value={insegnanteId}
                        onChange={(e) => setInsegnanteId(e.target.value)}
                    >
                        <option value="">Scegli…</option>
                        {ISTRUTTRICI.map((i) => (
                            <option key={i.id} value={i.id}>{i.nome}</option>
                        ))}
                    </select>
                </div>
            )}

            <p className="nota">Durata 50 minuti · 3 posti</p>

            {errore && <p className="errore">{errore}</p>}

            <button
                className="btn-primario btn-largo"
                type="submit"
                disabled={inviando}
                onPointerDown={creaOnda}
            >
                {inviando ? 'Creazione…' : 'Crea lezione'}
            </button>
        </form>
    )
}