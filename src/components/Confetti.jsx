const COLORI = ['#6F8567', '#C5D2B5', '#E4E0D7', '#323232']
const QUANTI = 40

// Numero "pseudo casuale" tra 0 e 1, sempre uguale per gli stessi input
function r(i, k) {
    const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
    return x - Math.floor(x)
}

export default function Confetti() {
    return (
        <div className="confetti" aria-hidden="true">
            {Array.from({ length: QUANTI }, (_, i) => (
                <span
                    key={i}
                    className="pezzo"
                    style={{
                        left: `${r(i, 1) * 100}%`,
                        backgroundColor: COLORI[i % COLORI.length],
                        animationDelay: `${r(i, 2) * 0.8}s`,
                        animationDuration: `${2.2 + r(i, 3) * 1.5}s`,
                        '--drift': `${(r(i, 4) - 0.5) * 120}px`,
                        '--rot': `${360 + r(i, 5) * 720}deg`,
                    }}
                />
            ))}
        </div>
    )
}