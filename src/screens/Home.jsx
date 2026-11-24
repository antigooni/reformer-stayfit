import { LOGO, FOTO_HOME, NOME_STUDIO } from '../config'

export default function Home({ onPrenota }) {
    return (
        <main className="home" style={{ '--foto': `url("${FOTO_HOME}")` }}>
            <div className="home-overlay" />
            <div className="home-contenuto">
                <img className="home-logo" src={LOGO} alt={NOME_STUDIO} />
                <button className="btn-primario" onClick={onPrenota}>
                    Prenota ora
                </button>
            </div>
        </main>
    )
}