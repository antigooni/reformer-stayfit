import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { getMioProfilo } from '../api'
import { NOME_PROPRIETARIA, NOMI_ISTRUTTRICI } from '../config'
import AdminLogin from './AdminLogin'
import Home from '../screens/Home'
import AdminLezioni from './AdminLezioni'
import { toISODate } from '../dateUtils'

function nomeSaluto(profilo) {
    if (profilo.ruolo === 'proprietario') return NOME_PROPRIETARIA
    return NOMI_ISTRUTTRICI[profilo.insegnante_id] ?? ''
}

export default function AdminApp() {
    // undefined = sto ancora controllando, null = nessuna sessione, oggetto = loggata
    const [sessione, setSessione] = useState(undefined)
    // Il profilo porta con sé l'id dell'utente a cui appartiene, per non mostrare dati di una sessione vecchia
    const [profilo, setProfilo] = useState(null)
    const [erroreProfilo, setErroreProfilo] = useState(null)
    const [schermata, setSchermata] = useState('home')
    const [giornoScelto, setGiornoScelto] = useState(() => toISODate(new Date()))

    // Non far indicizzare la pagina admin dai motori di ricerca
    useEffect(() => {
        const meta = document.createElement('meta')
        meta.name = 'robots'
        meta.content = 'noindex'
        document.head.appendChild(meta)
        return () => meta.remove()
    }, [])

    // Sessione: lettura iniziale (dal dispositivo) e ascolto di login e logout
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSessione(data.session))
        const { data } = supabase.auth.onAuthStateChange((_evento, nuova) => {
            setSessione(nuova)
        })
        return () => data.subscription.unsubscribe()
    }, [])

    // Quando c'è una sessione, leggo il profilo
    const userId = sessione?.user?.id
    useEffect(() => {
        if (!userId) return
        let annullato = false
        getMioProfilo()
            .then((p) => {
                if (annullato) return
                if (p) setProfilo({ ...p, userId })
                else setErroreProfilo({ userId, testo: 'Questo account non ha un profilo amministrativo.' })
            })
            .catch(() => {
                if (!annullato) setErroreProfilo({ userId, testo: 'Impossibile leggere il profilo. Riprova.' })
            })
        return () => {
            annullato = true
        }
    }, [userId])

    async function esci() {
        setSchermata('home')
        await supabase.auth.signOut()
    }

    if (sessione === undefined) {
        return <p className="vuoto" style={{ padding: 24 }}>Caricamento…</p>
    }

    if (sessione === null) {
        return <AdminLogin />
    }

    if (erroreProfilo?.userId === userId) {
        return (
            <main className="prenota">
                <h1>Accesso non disponibile</h1>
                <p className="errore">{erroreProfilo.testo}</p>
                <button className="btn-secondario" onClick={esci}>Esci</button>
            </main>
        )
    }

    if (profilo?.userId !== userId) {
        return <p className="vuoto" style={{ padding: 24 }}>Caricamento…</p>
    }

    if (schermata === 'home') {
        return (
            <Home
                testoPulsante="Gestisci le tue lezioni"
                onPrenota={() => setSchermata('lezioni')}
            />
        )
    }

    if (schermata === 'statistiche') {
        return (
            <main className="prenota">
                <button
                    className="freccia"
                    onClick={() => setSchermata('lezioni')}
                    aria-label="Torna alle lezioni"
                >
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
                <h1>Statistiche</h1>
                <div className="lista">
                    <p className="vuoto">In arrivo.</p>
                </div>
            </main>
        )
    }

    return (
        <AdminLezioni
            nome={nomeSaluto(profilo)}
            giornoScelto={giornoScelto}
            onCambiaGiorno={setGiornoScelto}
            onIndietro={() => setSchermata('home')}
            onEsci={esci}
            onStatistiche={() => setSchermata('statistiche')}
            ruolo={profilo.ruolo}
        />
    )

}