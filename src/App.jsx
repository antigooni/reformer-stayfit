import { useEffect, useState } from 'react'
import { getLezioni } from './api'

function App() {
  const [lezioni, setLezioni] = useState([])
  const [errore, setErrore] = useState(null)

  useEffect(() => {
    getLezioni('2026-11-25', '2026-11-28')
      .then(setLezioni)
      .catch((e) => setErrore(e.message))
  }, [])

  return (
    <div>
      <h1>Test collegamento</h1>
      {errore && <p style={{ color: 'red' }}>{errore}</p>}
      <p>Lezioni trovate: {lezioni.length}</p>
      <ul>
        {lezioni.map((l) => (
          <li key={l.id}>
            {l.data_lezione} {l.ora} con {l.insegnante}: {l.posti_liberi}/{l.capienza} posti liberi
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App