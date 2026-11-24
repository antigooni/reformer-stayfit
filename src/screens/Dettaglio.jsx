import { useState } from 'react'
import { prenotaLezione } from '../api'
import { FOTO_LEZIONE } from '../config'
import { dataEstesa, oraBreve } from '../dateUtils'
import Modal from '../components/Modal'

// Tiene solo le cifre; se incollano +39... toglie il prefisso
function pulisciTelefono(valore) {
    let cifre = valore.replace(/\D/g, '')
    if (cifre.length > 10 && cifre.startsWith('39')) cifre = cifre.slice(2)
    return cifre.slice(0, 10)
}

export default function Dettaglio({ lezione, onIndietro, onConfermata }) {
    const [nome, setNome] = useState('')
    const [telefono, setTelefono] = useState('')
    const [inviando, setInviando] = useState(false)
    const [erroreForm, setErroreForm] = useState('')
    const [popup, setPopup] = useState(null)

    async function invia(e) {
        e.preventDefault()
        if (inviando) return // evita il doppio click

        const nomePulito = nome.trim()
        if (!nomePulito) {
            setErroreForm('Inserisci il tuo nome.')
            return
        }
        if (telefono.length !== 10) {
            setErroreForm('Il numero di telefono deve avere 10 cifre.')
            return
        }

        setErroreForm('')
        setInviando(true)
        const risposta = await prenotaLezione(lezione.id, nomePulito, telefono)
        setInviando(false)

        if (risposta.successo) onConfermata()
        else setPopup(risposta)
    }

    function chiudiPopup() {
        const codice = popup.codice
        setPopup(null)
        if (codice === 'LEZIONE_COMPLETA') onIndietro()
    }

    return (
        <main className="dettaglio" style={{ backgroundImage: `url(${FOTO_LEZIONE})` }}>
            <div className="dettaglio-overlay" />
            <div className="dettaglio-inner">
                <div className="dettaglio-testa">
                    <button className="indietro" onClick={onIndietro} aria-label="Torna indietro">
                        ←
                    </button>
                    <div className="dettaglio-titolo">
                        <h1>Lezione di Reformer</h1>
                        <p>
                            {dataEstesa(lezione.data_lezione)} · {oraBreve(lezione.ora)} · con {lezione.insegnante}
                            <br />
                            {lezione.posti_liberi}/{lezione.capienza} posti disponibili
                        </p>
                    </div>
                </div>

                <form className="sheet" onSubmit={invia} noValidate>
                    <div className="campo">
                        <label htmlFor="nome">Nome</label>
                        <input
                            id="nome"
                            className="input"
                            type="text"
                            autoComplete="name"
                            maxLength={60}
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="telefono">Numero di telefono</label>
                        <div className="telefono">
                            <span className="prefisso">+39</span>
                            <input
                                id="telefono"
                                className="input"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                value={telefono}
                                onChange={(e) => setTelefono(pulisciTelefono(e.target.value))}
                            />
                        </div>
                    </div>

                    {erroreForm && <p className="errore">{erroreForm}</p>}

                    <button className="btn-primario btn-largo" type="submit" disabled={inviando}>
                        {inviando ? 'Invio in corso…' : 'Prenota ora'}
                    </button>
                </form>
            </div>

            {popup && (
                <Modal titolo="Prenotazione non riuscita" testo={popup.messaggio} onChiudi={chiudiPopup} />
            )}
        </main>
    )
}