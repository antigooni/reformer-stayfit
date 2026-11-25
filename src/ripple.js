// Crea un'onda che parte dal punto del tocco dentro il pulsante premuto
export function creaOnda(e) {
  const pulsante = e.currentTarget
  if (pulsante.disabled) return

  const rect = pulsante.getBoundingClientRect()
  // Diametro: abbastanza grande da coprire il pulsante anche partendo da un angolo
  const diametro = Math.hypot(rect.width, rect.height) * 2

  const onda = document.createElement('span')
  onda.className = 'onda'
  onda.style.width = `${diametro}px`
  onda.style.height = `${diametro}px`
  onda.style.left = `${e.clientX - rect.left - diametro / 2}px`
  onda.style.top = `${e.clientY - rect.top - diametro / 2}px`

  pulsante.appendChild(onda)
  onda.addEventListener('animationend', () => onda.remove())
}