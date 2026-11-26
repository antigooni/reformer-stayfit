import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { creaOnda } from '../ripple'

// Gli username sono indirizzi tecnici: non sono caselle di posta vere
const DOMINIO = '@stayfit.internal'

export default function AdminLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [inviando, setInviando] = useState(false)
    const [errore, setErrore] = useState('')

    async function accedi(e) {
        e.preventDefault()
        if (inviando) return

        const user = username.trim().toLowerCase()
        if (!user || !password) {
            setErrore('Inserisci username e password.')
            return
        }

        setErrore('')
        setInviando(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: user + DOMINIO,
            password,
        })
        setInviando(false)

        if (error) {
            console.error('Login non riuscito:', error.message)
            if (error.message === 'Invalid login credentials') {
                setErrore('Username o password non corretti.')
            } else if (error.message === 'Email not confirmed') {
                setErrore('Account non ancora attivato. Contatta Mary.')
            } else {
                setErrore('Accesso non riuscito. Controlla la connessione e riprova.')
            }
        }
        // Se va bene non serve fare altro: AdminApp si accorge della nuova sessione
    }

    return (
        <main className="prenota login">
            <h1>Area amministrativa</h1>
            <p style={{ color: 'var(--grey)', margin: '0 0 24px' }}>
                Accedi per gestire le lezioni.
            </p>

            <form onSubmit={accedi} noValidate>
                <div className="campo">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        className="input"
                        type="text"
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="campo">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        className="input"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {errore && <p className="errore">{errore}</p>}

                <button
                    className="btn-primario btn-largo"
                    type="submit"
                    disabled={inviando}
                    onPointerDown={creaOnda}
                >
                    {inviando ? 'Accesso in corso…' : 'Accedi'}
                </button>
            </form>
        </main>
    )
}