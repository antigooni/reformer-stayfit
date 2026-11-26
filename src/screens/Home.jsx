import { useEffect } from 'react'
import { LOGO, FOTO_HOME, NOME_STUDIO } from '../config'
import { creaOnda } from '../ripple'

export default function Home({ onPrenota, testoPulsante = 'Prenota ora' }) {
    useEffect(() => {
        const meta = document.querySelector('meta[name="theme-color"]')
        meta?.setAttribute('content', '#1c1c1c')
        document.documentElement.classList.add('home-attiva')

        return () => {
            meta?.setAttribute('content', '#ffffff')
            document.documentElement.classList.remove('home-attiva')
        }
    }, [])

    return (
        <main className="home" style={{ backgroundImage: `url(${FOTO_HOME})` }}>
            <div className="home-overlay" />
            <div className="home-contenuto">
                <img className="home-logo" src={LOGO} alt={NOME_STUDIO} />
                <button className="btn-primario" onPointerDown={creaOnda} onClick={onPrenota}>
                    {testoPulsante}
                </button>
            </div>
        </main>
    )
}