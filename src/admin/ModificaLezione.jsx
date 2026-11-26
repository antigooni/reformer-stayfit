import { useState } from 'react'
import { createPortal } from 'react-dom'
import { adminModificaLezione } from '../api'
import { dataEstesa, oraBreve, toISODate } from '../dateUtils'
import Modal from '../components/Modal'
import { creaOnda } from '../ripple'

export default function ModificaLezione({ lezione, dataMax, prenotate, onModificata }) {
    const dataOriginale = lezione.data_lezione
    const oraOriginale = oraBreve(lezione.ora)

    const [data, setData] = useState(dataOriginale)
    const [ora, setOra] = useState(oraOriginale)
    const [inConferma, setInConferma] = useState(false)
    const [inviando, setInviando] = useState(false)
    const [errore, setErrore] = useState('')

    const adesso = new Date()
    const oggi = toISODate(adesso)
    const oraAdesso =
        String(adesso.getHours()).padStart(2, '0') + ':' + String(adesso.getMinutes()).padStart(2, '0')

    // Controlli rapidi per l'utente: quelli veri li rifà il database
    function controlla(e) {
        e.preventDefault()
        if (inviando) return

        if (!data) return setErrore('Scegli una data.')
        if (!ora) return setErrore('Scegli un orario.')
        if (data === dataOriginale && ora === oraOriginale) return setErrore('Non hai cambiato niente.')
        if (data < oggi) return setErrore('Non puoi spostare una lezione nel passato.')
        if (data > dataMax) return setErrore('Puoi spostare la lezione entro i prossimi 14 giorni.')
        if (data === oggi && ora <= oraAdesso) return setErrore('Scegli un orario non ancora passato.')

        setErrore('')
        setInConferma(true)
    }

    async function salva() {
        setInConferma(false)
        setInviando(true)
        const risposta = await adminModificaLezione(lezione.id, data, ora)
        setInviando(false)

        if (risposta.successo) onModificata(data, ora)
        else setErrore(risposta.messaggio)
    }

    let testoConferma = `La lezione sarà spostata a ${dataEstesa(data)} alle ${ora}.`
    if (prenotate > 0) {
        const chi = prenotate === 1 ? 'C’è 1 cliente già prenotata.' : `Ci sono ${prenotate} clienti già prenotate.`
        testoConferma += ` ${chi} Si ricorda di comunicare la modifica agli utenti già prenotati.`
    }

    return (
        <form onSubmit={controlla} noValidate>
            <div className="campo">
                <label htmlFor="ml-data">Data</label>
                <input
                    id="ml-data"
                    className="input"
                    type="date"
                    min={oggi}
                    max={dataMax}
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                />
            </div>

            <div className="campo">
                <label htmlFor="ml-ora">Ora</label>
                <input
                    id="ml-ora"
                    className="input"
                    type="time"
                    min={data === oggi ? oraAdesso : undefined}
                    value={ora}
                    onChange={(e) => setOra(e.target.value)}
                />
            </div>

            <p className="nota">Istruttrice, durata e posti non si possono modificare.</p>

            {errore && <p className="errore">{errore}</p>}

            <button
                className="btn-primario btn-largo"
                type="submit"
                disabled={inviando}
                onPointerDown={creaOnda}
            >
                {inviando ? 'Salvataggio…' : 'Salva modifiche'}
            </button>

            {inConferma &&
                createPortal(
                    <Modal
                        titolo="Confermi la modifica?"
                        testo={testoConferma}
                        etichettaConferma="Conferma"
                        onChiudi={() => setInConferma(false)}
                        onConferma={salva}
                    />,
                    document.body
                )}
        </form>
    )
}