import { useEffect, useRef } from 'react'

// Pannello che sale dal basso e prende circa metà pagina.
// Si chiude toccando lo sfondo scuro oppure premendo Esc.
export default function BottomSheet({ titolo, onChiudi, children }) {
    // Tengo l'ultima versione di onChiudi senza far ripartire l'effetto a ogni render
    const chiudi = useRef(onChiudi)
    useEffect(() => {
        chiudi.current = onChiudi
    })

    useEffect(() => {
        function tasto(e) {
            if (e.key === 'Escape') chiudi.current()
        }
        document.addEventListener('keydown', tasto)

        // Blocca lo scorrimento della pagina sotto il pannello
        const precedente = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', tasto)
            document.body.style.overflow = precedente
        }
    }, [])

    return (
        <div className="pannello-sfondo" onClick={onChiudi}>
            <div
                className="pannello"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pannello-titolo"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="pannello-maniglia" aria-hidden="true" />
                {titolo && <h2 id="pannello-titolo">{titolo}</h2>}
                {children}
            </div>
        </div>
    )
}