import { useState } from 'react'
import { adminAggiungiPrenotazione } from '../api'
import { pulisciTelefono } from '../telefono'
import { creaOnda } from '../ripple'

export default function AggiungiPrenotazione({ lezioneId, onAggiunta, onAnnulla }) {
    const [nome, setNome] = useState('')
    const [telefono, setTelefono] = useState('')
    const [inviando, setInviando] = useState(false)
    const [errore, setErrore] = useState('')

    async function invia(e) {
        e.preventDefault()
        if (inviando) return

        // Controlli rapidi per l'utente: quelli veri li rifà il database
        const nomePulito = nome.trim()
        if (!nomePulito) return setErrore('Inserisci il nome.')
        if (telefono.length !== 10) return setErrore('Il numero di telefono deve avere 10 cifre.')

        setErrore('')
        setInviando(true)
        const risposta = await adminAggiungiPrenotazione(lezioneId, nomePulito, telefono)
        setInviando(false)

        if (risposta.successo) onAggiunta()
        else setErrore(risposta.messaggio)
    }

    return (
        <form onSubmit={invia} noValidate>
            <div className="campo">
                <label htmlFor="ap-nome">Nome</label>
                <input
                    id="ap-nome"
                    className="input"
                    type="text"
                    autoComplete="off"
                    maxLength={60}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />
            </div>

            <div className="campo">
                <label htmlFor="ap-telefono">Numero di telefono</label>
                <div className="telefono">
                    <span className="prefisso">+39</span>
                    <input
                        id="ap-telefono"
                        className="input"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="off"
                        value={telefono}
                        onChange={(e) => setTelefono(pulisciTelefono(e.target.value))}
                    />
                </div>
            </div>

            {errore && <p className="errore">{errore}</p>}

            <div className="pannello-azioni">
                <button type="button" className="btn-secondario" onClick={onAnnulla}>
                    Annulla
                </button>
                <button
                    type="submit"
                    className="btn-primario"
                    disabled={inviando}
                    onPointerDown={creaOnda}
                >
                    {inviando ? 'Invio…' : 'Prenota'}
                </button>
            </div>
        </form>
    )
}