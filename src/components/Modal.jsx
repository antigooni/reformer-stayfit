// Senza onConferma: popup informativo con un solo pulsante "Ho capito" (come prima).
// Con onConferma: popup di conferma con due pulsanti, Annulla e Conferma.
export default function Modal({
    titolo,
    testo,
    onChiudi,
    onConferma,
    etichettaConferma = 'Conferma',
    etichettaAnnulla = 'Annulla',
}) {
    return (
        <div className="modal-sfondo" onClick={onChiudi}>
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-titolo"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="modal-titolo">{titolo}</h2>
                <p>{testo}</p>

                {onConferma ? (
                    <div className="modal-azioni">
                        <button className="btn-secondario" onClick={onChiudi}>
                            {etichettaAnnulla}
                        </button>
                        <button className="btn-primario" onClick={onConferma}>
                            {etichettaConferma}
                        </button>
                    </div>
                ) : (
                    <button className="btn-primario" onClick={onChiudi}>
                        Ho capito
                    </button>
                )}
            </div>
        </div>
    )
}