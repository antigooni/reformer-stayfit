export default function Modal({ titolo, testo, onChiudi }) {
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
                <button className="btn-primario" onClick={onChiudi}>
                    Ho capito
                </button>
            </div>
        </div>
    )
}