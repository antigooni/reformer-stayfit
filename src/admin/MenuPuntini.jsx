import { useEffect, useRef, useState } from 'react'

// Menu a tre puntini. "voci" è una lista di { etichetta, onClick }
export default function MenuPuntini({ voci }) {
    const [aperto, setAperto] = useState(false)
    const contenitore = useRef(null)

    // Quando è aperto: chiudi toccando fuori o premendo Esc
    useEffect(() => {
        if (!aperto) return

        function fuori(e) {
            if (!contenitore.current?.contains(e.target)) setAperto(false)
        }
        function tasto(e) {
            if (e.key === 'Escape') setAperto(false)
        }

        document.addEventListener('pointerdown', fuori)
        document.addEventListener('keydown', tasto)
        return () => {
            document.removeEventListener('pointerdown', fuori)
            document.removeEventListener('keydown', tasto)
        }
    }, [aperto])

    return (
        <div className="menu" ref={contenitore}>
            <button
                className="menu-btn"
                onClick={() => setAperto((a) => !a)}
                aria-label="Menu"
                aria-haspopup="menu"
                aria-expanded={aperto}
            >
                <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                    <circle cx="12" cy="5" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="19" r="2" fill="currentColor" />
                </svg>
            </button>

            {aperto && (
                <div className="menu-lista" role="menu">
                    {voci.map((v) => (
                        <button
                            key={v.etichetta}
                            className="menu-voce"
                            role="menuitem"
                            onClick={() => {
                                setAperto(false)
                                v.onClick()
                            }}
                        >
                            {v.etichetta}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}