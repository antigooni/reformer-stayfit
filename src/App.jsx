import { useState } from 'react'
import Home from './screens/Home'
import Prenota from './screens/Prenota'
import Dettaglio from './screens/Dettaglio'
import Conferma from './screens/Conferma'
import { toISODate } from './dateUtils'

export default function App() {
  const [schermata, setSchermata] = useState('home')
  const [lezione, setLezione] = useState(null)
  const [giornoScelto, setGiornoScelto] = useState(() => toISODate(new Date()))

  if (schermata === 'prenota') {
    return (
      <Prenota
        giornoScelto={giornoScelto}
        onCambiaGiorno={setGiornoScelto}
        onSeleziona={(l) => {
          setLezione(l)
          setSchermata('dettaglio')
        }}
        onIndietro={() => setSchermata('home')}
      />
    )
  }

  if (schermata === 'dettaglio') {
    return (
      <Dettaglio
        lezione={lezione}
        onIndietro={() => setSchermata('prenota')}
        onConfermata={() => setSchermata('conferma')}
      />
    )
  }

  if (schermata === 'conferma') {
    return <Conferma lezione={lezione} onHome={() => setSchermata('home')} />
  }

  return <Home onPrenota={() => setSchermata('prenota')} />
}