import Confetti from '../components/Confetti'
import { dataEstesa, oraBreve } from '../dateUtils'

export default function Conferma({ lezione, onHome }) {
    return (
        <main className="conferma">
            <Confetti />

            <svg className="spunta" viewBox="0 0 52 52" aria-hidden="true">
                <circle className="spunta-cerchio" cx="26" cy="26" r="24" fill="none" />
                <path className="spunta-segno" fill="none" d="M14 27l8 8 16-17" />
            </svg>

            <h1>Prenotazione confermata</h1>
            <p>Contattare l’insegnante per eventuali cancellazioni</p>

            <div className="riepilogo">
                <p>Lezione Reformer</p>
                <p>{dataEstesa(lezione.data_lezione)}</p>
                <p>Ore {oraBreve(lezione.ora)}</p>
            </div>

            <button className="btn-secondario" onClick={onHome}>
                Torna all’inizio
            </button>
        </main>
    )
}